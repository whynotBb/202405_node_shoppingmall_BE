const User = require('../models/User');
const bcrypt = require('bcryptjs');

const userController = {};

userController.createUser = async (req, res) => {
    try {
        let {email, name, password, level} = req.body;
        const user = await User.findOne({email});
        if (user) {
            throw new Error('이미 가입된 email 입니다.');
        }

        // password 암호화
        const salt = bcrypt.genSaltSync(10);
        password = bcrypt.hashSync(password, salt);

        const newUser = new User({email, name, password, level: level ? level : 'customer'});
        await newUser.save();
        return res.status(200).json({status: 'success', data: newUser});
    } catch (error) {
        res.status(400).json({status: 'fail', error: error.message});
    }
};

module.exports = userController;
