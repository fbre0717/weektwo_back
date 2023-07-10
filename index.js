//index.js
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  userId : String,
  password : String
});

UserSchema.methods.comparePassword = async function (inputPassword) {
  if(inputPassword == this.password){
    return true;
  } else {
    return false;
  }
};

const User = mongoose.model('User', UserSchema);

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/week');
  console.log("connect");
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', async (req, res) => {
  res.send('Hello World!asd')
})

app.post('/signup', async (req, res) => {
  try {
    const existingUser = await User.findOne({ userId: req.body.userId });

    if (existingUser) {
      res.status(400).json({ message: '이미 존재하는 userId입니다.' });
    } else {
      const user = new User(req.body);
      await user.save();
      res.status(200).json({ message: '회원 가입에 성공하였습니다.' });
    }
  } catch (error) {
    console.error('Error:', error); // 오류 메시지를 콘솔에 출력
    res.status(500).json({ message: '서버 오류로 인해 회원 가입에 실패하였습니다.' });
  }
});


app.post('/signin', async (req, res) => {
  try {
    // 요청된 userId로 사용자 찾기
    const user = await User.findOne({ userId: req.body.userId });

    if (user) {
      // 비밀번호가 일치하는지 확인
      const validPassword = await user.comparePassword(req.body.password);

      if (validPassword) {
        res.status(200).json({ message: '로그인에 성공하였습니다.' });
      } else {
        res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });
      }
    } else {
      res.status(404).json({ message: '존재하지 않는 userId입니다.' });
    }
  } catch (error) {
    console.error('Error:', error); // 오류 메시지를 콘솔에 출력
    res.status(500).json({ message: '서버 오류로 인해 로그인에 실패하였습니다.' });
  }
});


app.post('/write', (req, res) => {
  console.log(req.body);
  res.status(200).json({ message: "일기를 작성하였습니다." });
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})