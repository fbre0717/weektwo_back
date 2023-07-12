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
  userId: String, 
  title: String,
  content : String
});

const Text = mongoose.model('text', TextSchema);


const ProfileSchema = new mongoose.Schema({
  userId: String,
  birth: String,
  hobby: String,
  imageUrl: String,
  username: String
});

const Profile = mongoose.model('profile', ProfileSchema);


const FriendSchema = new mongoose.Schema({
  userId: String,
  friendList: [String]
});

const Friend = mongoose.model('friend', FriendSchema);

const MapCount = new Map();

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
  res.send('Hello World!');
})

app.post('/signup', async (req, res) => {
  try {
    const existingUser = await User.findOne({ userId: req.body.userId });

    if (existingUser) {
      res.status(400).json({ message: '!!!!!!이미 존재하는 userId!!!!!' });
    } else {
      const user = new User(req.body);
      await user.save();
      const newProfile = new Profile({
        userId: req.body.userId,
        birth: "none",
        hobby: "none",
        imageUrl: "https://via.placeholder.com/300",
        username:req.body.username
      });
      await newProfile.save();
      const friendData = {
        userId: req.body.userId,
        friendList: []
      };
      
      const friend = new Friend(friendData);
      await friend.save();
      
      MapCount.set(req.body.userId, 0);
      res.status(200).json({ message: '회원 가입에 성공!' });
    }
  } catch (error) {
    console.error('Error:', error); // 오류 메시지를 콘솔에 출력
    res.status(500).json({ message: '서버 오류로 인해 회원 가입에 실패하였습니다.' });
  }
});

app.post('/kakao_signup', async (req, res) => {
// req :
//   {userId : "",
//    username: "",
//    birth: "",
//    imageUrl:"" }

// res :
//   Case1: 유저가 이미 존재하는 경우 -> { message: '!!!!!!이미 존재하는 userId!!!!!' }
//   Case2: 유저가 잘 추가된 경우 --> { message: '회원 가입에 성공!' }
//   Case3: 그 외 오류 --> { message: '서버 오류로 인해 회원 가입에 실패하였습니다.' }

  try {
    const existingUser = await User.findOne({ userId: req.body.userId });

    if (existingUser) {
      res.status(400).json({ message: '!!!!!!이미 존재하는 userId!!!!!' });
    } else {
      const user = new User({
        userId: req.body.userId,
        username: "none",
        password : "none"
      });
      await user.save();
      const newProfile = new Profile({
        userId: req.body.userId,
        birth: req.body.birth,
        hobby: "none",
        imageUrl: "none",
        username:"none"
      });
      await newProfile.save();
      const friendData = {
        userId: req.body.userId,
        friendList: []
      };
      
      const friend = new Friend(friendData);
      await friend.save();
      
      MapCount.set(req.body.userId, 0);
      res.status(200).json({ message: '회원 가입에 성공!' });
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
  
  // req (예시): 
  //    {"userId" : "build_gates",
  //     "title": "7월 12일 일기2",
  //     "content" : "한게 없다 하..2" }
  // res :
  //   Case1: 이미 같은 유저가 같은 제목의 게시글을 작성한 경우 
  //    { message: '이미 같은 제목의 게시글이 있습니다.' } 
  //   Case2 : 정상  { message: "일기를 작성!" }
  //   Case3 : 예외  { message: '서버 오류로 인해 write에 실패하였습니다.' }
  
  try {
    // 요청된 title로 사용자 찾기
    const t = await Text.findOne({ title: req.body.title, userId: req.body.userId });

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
  // req (예시) :
  //    { "userId": "test12345" }

  // res (예시) : 
  //     { "_id": "64ad966cb8b6692021775ee2",
  //     "userId": "test12345",
  //     "birth": "none",
  //     "hobby": "none",
  //     "imageUrl": "none",
  //     "username": "KING",
  //     "__v": 0  
  //     }

  
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

app.post('/modify_profile', async (req, res) => {
  // req (예시):
    // "userId": "build__gates",
    //   "type" : "hobby",
    //   "content": "2002-06-17"
  // 같은 형식으로 req
  // type은 "hobby" 이거나 "birth" , "imageUrl" 셋 중에 하나. 이외에는 수정하지 않고 무시.
  try {
    // 같은 userId 있나 확인
    const t = await Profile.findOne({ userId: req.body.userId });

    if (t) {
      if (req.body.type == "hobby") {
        if (t.hobby == req.body.content) {
          res.status(200).json({ message: 'hobby 수정 내용이 기존의 내용과 같습니다' });    
        } else {
          res.status(200).json({ message: 'hobby 수정이 정상적으로 완료되었습니다' });
          t.hobby = req.body.content;
          await t.save();
        }
      } else if (req.body.type == "birth") {
        if (t.birth == req.body.content) {
          res.status(200).json({ message: 'birth 수정 내용이 기존의 내용과 같습니다' });    
        } else {
          res.status(200).json({ message: 'birth 수정이 정상적으로 완료되었습니다' });
          t.birth = req.body.content;
          await t.save();
        }
      } else if (req.body.type == "imageUrl") {
        if (t.ImageUrl == req.body.content) {
          res.status(200).json({ message: 'imageUrl 수정 내용이 기존의 내용과 같습니다' });    
        } else {
          res.status(200).json({ message: 'imageUrl 수정이 정상적으로 완료되었습니다' });
          t.imageUrl = req.body.content;
          await t.save();
        }
      } else if (req.body.type == "username") {
        if (t.username == req.body.content) {
          res.status(200).json({ message: 'username 수정 내용이 기존의 내용과 같습니다' });    
        } else {
          res.status(200).json({ message: 'username 수정이 정상적으로 완료되었습니다' });
          t.username = req.body.content;
          await t.save();
        }
      } else {
        res.status(400).json({ message: '그런 type이 없어 수정이 되지 않았습니다' });
      }
      
      
    } else {
      res.status(400).json({ message: "user_id 가 같은 유저가 없습니다" });
    }
    
  } catch (error) {
    console.error('Error:', error); // 오류 메시지를 콘솔에 출력
    res.status(500).json({ message: '서버 오류로 인해 show_profile에 실패하였습니다.' });
  }
});

app.post('/modify_user', async (req, res) => {
  // req :
    // "userId": "",
    // "type" : 'username' 또는 'password' 
    //   "what": 바꾸려는 내용

    // 예시 :
  //   {
  //     "userId": "Ace",
  //     "type" : "password",
  //     "what" : "sfkjdfcerbnfd"
  //    }
  // 

  //res  : 
  // 0)	변경하려는 userId가 user스키마에 없는 경우
  //  { message: '그런 userId가 없어 수정을 할 수 없습니다' }
  // 1)	type이 “username” 인 경우
    // C1. 변경하려는 내용이 기존과 똑같은 경우
  // 	{ message: 'username 수정하려는 내용이 기존의 내용과 같습니다' }
  //   C2. 정상
  // 	{ message: 'username 수정이 정상적으로 완료되었습니다' }
  // 2)	type이 “password” 인 경우
    // C1. 변경하려는 내용이 기존과 똑같은 경우
  // 	{ message: 'password 수정하려는 내용이 기존의 내용과 같습니다' }
  //   C2. 정상
  // 	{ message: 'password 수정이 정상적으로 완료되었습니다' }
  // 3)	Type이 위 두 개 이외의 것이 나온 경우
  // 	{ message: '그런 type이 없어 수정이 되지 않았습니다' }
    
  try {
    // 같은 userId 있나 확인

    if (req.body.type == "username") {
      const t = await User.findOne({userId : req.body.userId });
      if (t) {
        if (t.username == req.body.what) {
          res.status(400).json({ message: 'username 수정하려는 내용이 기존의 내용과 같습니다' });    
        } else {
          t.username = req.body.what;
          await t.save();
          res.status(200).json({ message: 'username 수정이 정상적으로 완료되었습니다' });
        }
      } else {
        res.status(400).json({ message: '그런 userId가 없어 수정을 할 수 없습니다' });
      }
    } else if (req.body.type == "password") {
      const t = await User.findOne({userId : req.body.userId });
      if (t) {
        if (t.password == req.body.what) {
          res.status(400).json({ message: 'password 수정하려는 내용이 기존의 내용과 같습니다' });    
        } else {
          res.status(200).json({ message: 'password 수정이 정상적으로 완료되었습니다' });
          t.password = req.body.what;
          await t.save();
        }
      } else {
        res.status(400).json({ message: '그런 userId가 없어 수정을 할 수 없습니다' });
      }
    } else {
      res.status(400).json({ message: '그런 type이 없어 수정이 되지 않았습니다' });
    }

  } catch (error) {
    console.error('Error:', error); // 오류 메시지를 콘솔에 출력
    res.status(500).json({ message: '서버 오류로 인해 show_profile에 실패하였습니다.' });
  }
});

app.post('/modify_text', async (req, res) => {
  //req
    // userId : "" 
    // "title": "",
    // "type" : "title" 또는 'content'. 둘 중에 바꾸려는 것
    // "what": 바꾸려는 내용
    // 
//  예시
  //   {
  //     "title": "없는 제목",
  //     "type" : "content",
  //     "what" : "의미없는 내용"
  //   }

//res
// 0)	변경하려는 title이 Text스키마에 없는 경우
  //  { message: '그런 title이 없어 수정을 할 수 없습니다' }
// 1)	type이 “title” 인 경우
   // C1. 변경하려는 내용이 기존과 똑같은 경우
  // 	{ message: 'title 수정하려는 내용이 기존의 내용과 같습니다' }	
  // 	C2. 정상
  // 	{ message: 'title 수정이 정상적으로 완료되었습니다'}
// 2)	type이 “content” 인 경우
   // C1. 변경하려는 내용이 기존과 똑같은 경우
  // 	{ message: content 수정 내용이 기존의 내용과 같습니다' }
  // 	C2. 정상
  // 	{ message: 'content 수정이 정상적으로 완료되었습니다' }
// 3)	Type이 위 두 개 이외의 것이 나온 경우
// 	{ message: ' 그런 type이 없어 수정이 되지 않았습니다' }

  try {
    // 같은 userId 있나 확인

    if (req.body.type == "title") {
      const t = await Text.findOne({userId: req.body.userId, title: req.body.title });
      if (t) {
        if (t.title == req.body.what) {
          res.status(400).json({ message: 'title 수정하려는 내용이 기존의 내용과 같습니다' });    
        } else {
          t.title = req.body.what;
          await t.save();
          res.status(200).json({ message: 'title 수정이 정상적으로 완료되었습니다' });
        }
      } else {
        res.status(400).json({ message: '그런 title이 없어 수정을 할 수 없습니다' });
      }
    } else if (req.body.type == "content") {
      const t = await Text.findOne({userId: req.body.userId, title: req.body.title });
      if (t) {
        if (t.content == req.body.what) {
          res.status(400).json({ message: 'content 수정 내용이 기존의 내용과 같습니다' });    
        } else {
          res.status(200).json({ message: 'content 수정이 정상적으로 완료되었습니다' });
          t.content = req.body.what;
          await t.save();
        }
      } else {
        res.status(400).json({ message: '그런 title이 없어 수정을 할 수 없습니다' });
      }
    } else {
      res.status(400).json({ message: '그런 type이 없어 수정이 되지 않았습니다' });
    }

  } catch (error) {
    console.error('Error:', error); // 오류 메시지를 콘솔에 출력
    res.status(500).json({ message: '서버 오류로 인해 show_profile에 실패하였습니다.' });
  }
});

app.post('/delete_text', async (req, res) => {
  // "userId":
  // "title": 삭제하고자 하는 게시글의 title,
  try {
    // 같은 title 있나 확인
    
    const result = await Text.deleteOne({ userId : req.body.userId, title: req.body.title });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: '게시글이 성공적으로 삭제되었습니다.' });
    } else {
      res.status(400).json({ message: '일치하는 게시글을 찾을 수 없습니다.' });
    }
    
  } catch (error) {
    console.error('Error:', error); // 오류 메시지를 콘솔에 출력
    res.status(500).json({ message: '서버 오류로 인해 delete_text에 실패하였습니다.' });
  }
});

app.post('/delete_profile', async (req, res) => {
  // "userId": 삭제하고자 하는 프로필의 userId,
  try {
    // 같은 userId 있나 확인
    
    const result = await Profile.deleteOne({ userId: req.body.userId });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: '프로필이 성공적으로 삭제되었습니다.' });
    } else {
      res.status(400).json({ message: '일치하는 프로필을 찾을 수 없습니다.' });
    }
    
  } catch (error) {
    console.error('Error:', error); // 오류 메시지를 콘솔에 출력
    res.status(500).json({ message: '서버 오류로 인해 delete_profile에 실패하였습니다.' });
  }
});

app.post('/add_profile', async (req, res) => {
//req예시
//   {
//    "userId": "testId",
//   "birth": "2000-01-01",
//   "hobby": "Coding",
//   "imageUrl": "none",
//   "username": "test_user"
//  }

// res :
// 1) userId가 이미 같은 것이 있는 경우
// --> { message: '같은 userId를 갖는 유저가 이미 있습니다' }
// 2) 정상
// --> { message: "유저를 추가했습니다" }
// 3) 예외
// --> { message: '서버 오류로 인해 add_profile에 실패하였습니다.' }
  try {
    const t = await Profile.findOne({ userId: req.body.userId });

    if (t) {
      
      res.status(200).json({ message: '같은 userId를 갖는 유저가 이미 있습니다' });
      
    } else {
      const newProfile = new Profile(req.body);
      await newProfile.save();
      res.status(200).json({ message: "유저를 추가했습니다" });
    }
    
  } catch (error) {
    console.error('Error:', error); // 오류 메시지를 콘솔에 출력
    res.status(500).json({ message: '서버 오류로 인해 add_profile에 실패하였습니다.' });
  }
});


app.post('/show_all_write', async (req, res) => {
  try {
    // userId : ""
    // 모든 데이터를 다 json으로 전달
    const allData = await Text.find({userId: req.body.userId}); // Text 모델의 모든 데이터 조회
    res.status(200).json(allData);

  } catch (error) {
    console.error('Error:', error); // 오류 메시지를 콘솔에 출력
    res.status(500).json({ message: '서버 오류로 인해 shaw_all_write에 실패하였습니다.' });
  }
});

app.post('/show_all_friend', async (req, res) => {
  try {
    // userId : ""
    const re = await Friend.findOne({ userId: req.body.userId });
    const results = [];
    if (re) {
      for (let i = 0; i < re.friendList.length; i++) {
        const t = re.friendList[i];
        const t2 = await Profile.findOne({ userId: t});
        if (t2) {
          const { userId, imageUrl, username } = t2;
          results.push({ userId, imageUrl, username });
        }
      }
      res.status(200).json(results);
    } else {
      res.status(404).json({ message: '존재하지 않는 userId입니다.' });
    }
    
  } catch (error) {
    console.error('Error:', error); // 오류 메시지를 콘솔에 출력
    res.status(500).json({ message: '서버 오류로 인해 shaw_all_write에 실패하였습니다.' });
  }
});


app.post('/add_friend', async (req, res) => {
  // userId : 누가
  // follow : 누구를

  try {
    const t = await Friend.findOne({ userId: req.body.userId });
    
    if (t) {
      const t2 = await Friend.findOne({ userId: req.body.follow });
      if (t2) {
        if (t.friendList.includes(req.body.follow)) {
          res.status(400).json({ message: '이미 친구 리스트에 있는 친구입니다.' });
        } else {
          t.friendList.push(req.body.follow); // req.body.follow를 friendList에 추가
          await t.save(); // 변경된 friend 저장
          res.status(200).json({ message: '친구 추가가 완료되었습니다.' });
          const val = MapCount.get(req.body.follow) + 1;
          MapCount.set(req.body.follow, val);
        }
      } else {
        res.status(400).json({ message: '추가하려는 user_id가 없어 친구 추가 실패' });
      }
    } else {
      res.status(400).json({ message: '그런 user_id가 없습니다' });
    }
  } catch (error) {
    console.error('Error:', error); // 오류 메시지를 콘솔에 출력
    res.status(500).json({ message: '서버 오류로 인해 add_friend에 실패하였습니다.' });
  }
});

// 수정 예정 기능 : 팔로워 수 구하는
app.post('/Get_Followers', async (req, res) => {
  try {
    //res.json(MapCount.size);
      MapCount.entries().forEach(entry => {
        console.log(entry[0], entry[1]);
      });
    const t = MapCount.has(req.body.userId);
    if (t) {
      const val = MapCount.get(req.body.userId);
      
      res.json(val);
    } else {
      res.json(100);
    }
  } catch (error) {
    console.error('Error:', error); // 오류 메시지를 콘솔에 출력
    res.status(500).json({ message: '서버 오류로 인해 Get_Followers 에 실패하였습니다.' });
  }  
});

// 팔로잉 수 구하는
app.post('/Get_Following', async (req, res) => {
  try {
    const t = await Friend.findOne({ userId: req.body.userId });
    if (t) {
      res.json(t.friendList.length);
      //res.status(200).json({ message: '팔로워' });
    } else {
      res.status(400).json({ message: '그런 user_id가 없습니다' });
    }
  } catch (error) {
    console.error('Error:', error); // 오류 메시지를 콘솔에 출력
    res.status(500).json({ message: '서버 오류로 인해 Get_Following에 실패하였습니다.' });
  }  
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})