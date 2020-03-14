let db = {
  users: [
    {
      userId: 'dh23ggj532g543j5gf43',
      email: 'user@gmail.com',
      handle: 'user',
      createdAt: '2020-02-26T14:27:43.046Z',
      imageUrl: 'image/dsfnwefewiof/eiwfhweoifh',
      bio: 'Hello my name is user, nice to meet you',
      website: 'https://user.com',
      location: 'Sydney, Australia'
    }
  ],
  smegas: [
    {
      userHandle: 'user',
      body: 'this is the body',
      createdAt: '2020-02-26T14:27:43.046Z',
      likeCount: 5,
      commentCount: 2
    }
  ],
  comments: [
    {
      userHandle: 'user',
      smegaId: 'kkdjdoiwdoiwqjdioqw',
      body: 'Hello world',
      createdAt: '2020-02-26T14:27:43.046Z'
    }
  ]
};

const userDetails = {
  // Redux data
  credentials: {
    userId: 'dh23ggj532g543j5gf43',
    email: 'user@gmail.com',
    handle: 'user',
    createdAt: '2020-02-26T14:27:43.046Z',
    imageUrl: 'image/dsfnwefewiof/eiwfhweoifh',
    bio: 'Hello my name is user, nice to meet you',
    website: 'https://user.com',
    location: 'Sydney, Australia'
  },
  likes: [
    {
      userHandle: 'user',
      smegaId: 'dwfwqwefeqfewfewfwqefqwf'
    },
    {
      userHandle: 'user',
      smegaId: 'dwfwqwefeqfeooionfqwf'
    }
  ]
};
