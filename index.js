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

const TextSchema = new mongoose.Schema({
  title: String,
  content : String,
});

const Text = mongoose.model('text', TextSchema);


const ProfileSchema = new mongoose.Schema({
  userId: String,
  birth: String,
  hobby: String
});

const Profile = mongoose.model('profile', ProfileSchema);


const FriendSchema = new mongoose.Schema({
  userId: String,
  friendList: [String]
});

const Friend = mongoose.model('friend', FriendSchema);

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
  res.send('Hello World!')
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


app.post('/write', async (req, res) => {
  
  try {
    // 요청된 title로 사용자 찾기
    const t = await Text.findOne({ title: req.body.title });

    if (t) {
      
      res.status(400).json({ message: '이미 같은 제목의 게시글이 있습니다.' });
      
    } else {
      console.log(req.body);
      const newtext = new Text(req.body);
      await newtext.save();
      res.status(200).json({ message: "일기를 작성!" });
    }
    
  } catch (error) {
    console.error('Error:', error); // 오류 메시지를 콘솔에 출력
    res.status(500).json({ message: '서버 오류로 인해 write에 실패하였습니다.' });
  }
});

app.post('/show_profile', async (req, res) => {
  
  try {
    const t = await Profile.findOne({ userId: req.body.userId });
    
    if (t) {
      res.json(t);
      // res.status(200).json({ message: '같은 userId를 갖는 유저를 찾았다' });
      
    } else {
      res.status(400).json({ message: "같은 userId를 갖는 유저를 못찾음" });
    }
    
  } catch (error) {
    console.error('Error:', error); // 오류 메시지를 콘솔에 출력
    res.status(500).json({ message: '서버 오류로 인해 show_profile에 실패하였습니다.' });
  }
});

app.post('/add_profile', async (req, res) => {
  
  try {
    const t = await Profile.findOne({ userId: req.body.userId });

    if (t) {
      
      res.status(200).json({ message: '같은 userId를 갖는 유저가 이미 있습니다' });
      
    } else {
      const newProfile = new Profile(req.body);
      await newProfile.save();
      res.status(400).json({ message: "유저를 추가했습니다" });
    }
    
  } catch (error) {
    console.error('Error:', error); // 오류 메시지를 콘솔에 출력
    res.status(500).json({ message: '서버 오류로 인해 show_profile에 실패하였습니다.' });
  }
});

app.get('/show_all_write', async (req, res) => {
  try {
    // 모든 데이터를 다 json으로 전달
    const allData = await Text.find(); // Text 모델의 모든 데이터 조회
    res.json(allData);
  } catch (error) {
    console.error('Error:', error); // 오류 메시지를 콘솔에 출력
    res.status(500).json({ message: '서버 오류로 인해 shaw_all_write에 실패하였습니다.' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})