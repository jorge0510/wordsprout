const { ObjectId } = require('mongodb');

module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, (req, res) => {
      const userId = req.user._id.toString();
    
      db.collection('words')
        .find({ userId: userId })
        .toArray((err, words) => {
          if (err) return res.status(500).send('Database error');
    
          // Corrected progress calculation per language
          const calcProgressForLanguage = (wordsArray, languageField) => {
            const wordsInLanguage = wordsArray.filter(w => w[languageField]); // Only words that exist in that language
    
            return {
              learned: wordsInLanguage.length,
              recognized: wordsInLanguage.filter(w => w.status && w.status[languageField] === 'Recognizes').length,
              said: wordsInLanguage.filter(w => w.status && w.status[languageField] === 'Says').length
            };
          };
    
          const progress = {
            english: calcProgressForLanguage(words, 'english'),
            spanish: calcProgressForLanguage(words, 'spanish'),
            portuguese: calcProgressForLanguage(words, 'portuguese')
          };
    
          // Render the profile
          res.render('profile.ejs', {
            user: req.user,
            words: words,
            progress: progress
          });
        });
    });
    

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout(() => {
          console.log('User has logged out!')
        });
        res.redirect('/');
    });

// Words ===============================================================


// GET /api/words - Get all words for the logged-in user
app.get('/words', isLoggedIn, (req, res) => {
  const userId = req.user.id;
  db.collection('words')
    .find({ userId: userId.toString() })
    .toArray((err, words) => {
      if (err) return res.status(500).send('Database error');
      res.json(words);
    });
});

// POST /api/words - Add a new word
app.post('/words', isLoggedIn, (req, res) => {
  const { english, spanish, portuguese, category, note } = req.body;

  if (!english && !spanish && !portuguese) {
    return res.status(400).json({ error: 'At least one language must be filled.' });
  }

  const newWord = {
    userId: req.user.id.toString(),
    english: english || null,
    spanish: spanish || null,
    portuguese: portuguese || null,
    category: category || '',
    note: note || '',
    status: {
      english: null,
      spanish: null,
      portuguese: null
    },
    createdAt: new Date()
  };

  db.collection('words').insertOne(newWord, (err, result) => {
    if (err) return res.status(500).send('Database error');
    res.redirect('/profile'); 
  });
});

app.post('/words/:id', isLoggedIn, (req, res) => {
  const { id } = req.params;
  const { statusEnglish, statusSpanish, statusPortuguese, note } = req.body;

  const updateFields = {};

  // Only update status if provided
  if (statusEnglish) updateFields['status.english'] = statusEnglish;
  if (statusSpanish) updateFields['status.spanish'] = statusSpanish;
  if (statusPortuguese) updateFields['status.portuguese'] = statusPortuguese;
  if (note) updateFields['note'] = note;

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update.' });
  }

  db.collection('words').findOneAndUpdate(
    { _id: new ObjectId(id), userId: req.user.id.toString() },
    { $set: updateFields },
    { returnDocument: 'after' },
    (err, result) => {
      if (err) {
        console.log(err)
        return res.status(500).send('Database error');
      }
      if (!result.value) return res.status(404).json({ error: 'Word not found.' });
      res.redirect('/profile');
    }
  );
});

// DELETE /api/words/:id - Delete a word
app.delete('/words/:id', isLoggedIn, (req, res) => {
  const { id } = req.params;

  db.collection('words').deleteOne(
    { _id: new require('mongodb').ObjectId(id), userId: req.user.id.toString() },
    (err, result) => {
      if (err) return res.status(500).send('Database error');
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Word not found.' });
      res.json({ message: 'Word deleted.' });
    }
  );
});

// GET /api/progress - Get progress statistics per language
app.get('/progress', isLoggedIn, (req, res) => {
  const userId = req.user.id;
  db.collection('words')
    .find({ userId: userId.toString() })
    .toArray((err, words) => {
      if (err) return res.status(500).send('Database error');

      const calcProgress = (langKey) => {
        return {
          learned: words.length,
          recognized: words.filter(w => w.status === 'Recognizes').length,
          said: words.filter(w => w.status === 'Says').length
        };
      };

      res.json({
        english: calcProgress('english'),
        spanish: calcProgress('spanish'),
        portuguese: calcProgress('portuguese')
      });
    });
});


// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
