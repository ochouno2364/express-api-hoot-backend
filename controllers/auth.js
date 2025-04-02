const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

const User = require('../models/user.js')


const saltRounds = 12


router.post('/sign-up', async (req, res) => {
//   res.json({ message: 'Sign up route' });

try {
 const userInDatabase = await User.findOne({username: req.body.username })

 if (userInDatabase) {
    return res.status(409).json({ error: 'Username already exsits'});
 }

  const user = await User.create({
    username: req.body.username,
    hashedPassword: bcrypt.hashSync(req.body.password, saltRounds)
  });

  const token = jwt.sign({ payload }, process.env.JWT_SECRET);

  res.status(201).json({ token });

} catch (error) {
  res.status(400).json({ error: error.message});
}
});




router.post('/sign-in', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username});
        if(!user) {
            res.status(401).json({ error: 'Invalid Credentials!' });
        }

        const isPasswordCorrect = bcrypt.compareSync(
            req.body.password, user.hashedPassword
        );

        if (!isPasswordCorrect) {
            res.status(200).json({ error: 'Invalid Credentials!' });
        }

        const payload = { username: user.username, _id: user._id };

        const token = jwt.sign({ payload }, process.env.JWT_SECRET);
        

        res.status(200).json({ message: 'Signing in!' });  
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  });

module.exports = router;