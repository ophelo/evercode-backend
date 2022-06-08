const reqUser = {
  __v: 0,
  _id: '6298e797ecccbe6bfbcf741f',
  email: 'user@gmail.com',
  username: 'user'
}

const prj = {
  _id: '6298e797ecccbe6bfbcf1234',
  title: "prova",
  language: "cpp",
  description: "prova descrizione",
  owners: []
}

const profile_user = {
  user: '6298e797ecccbe6bfbcf741f'
}

const profile_user2 = {
  user: '6298e797ecccbe6bfbcf845f'
}

const friend = {
  _id: '6298e797ecccbe6bfbcf845f',
  email: 'amico1@gmail.com',
  username: 'matteoGang'
}

const friend_request = {
  _id: '6298e797ecccbe6bfbcf666f',
  sender: '6298e797ecccbe6bfbcf741f',
  receiver: '6298e797ecccbe6bfbcf845f'
}

const friend_request2 = {
  _id: '6298e797ecccbe6bfbcf666f',
  receiver: '6298e797ecccbe6bfbcf741f',
  sender: '6298e797ecccbe6bfbcf845f'
}


module.exports = {
  reqUser,
  prj,
  profile_user,
  profile_user2,
  friend,
  friend_request,
  friend_request2
}