const express = require("express");
const serveStatic = require("serve-static");
const path = require("path");
const app = express();
let port = process.env.PORT || 3001;

const server = app
  .use("/", serveStatic(path.join(__dirname, "../dist")))
  .listen(port, () => {
    console.log(`server running on port ${port}`);
  });
app.get(/.*/, function (req, res) {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

const io = require("socket.io")(server);
let connections = [];
let connectedNames = [];
let roomsState = [];
let disconnectedUsers = [];
let leaveUsers = [];
let roomNumb = 10;
let events = [{
    id: 1,
    title: "Выход на рынок нового конкурента",
    description: "Снижение всех видов трафика на 30%",
    dataChange: [{
        param: "organicCount",
        operation: "*",
        change: 0.7,
        when: 0,
        event: true
      },
      {
        param: "contextCount",
        operation: "*",
        change: 0.7,
        when: 0,
        event: true
      },
      {
        param: "socialsCount",
        operation: "*",
        change: 0.7,
        when: 0,
        event: true
      },
      {
        param: "smmCount",
        operation: "*",
        change: 0.7,
        when: 0,
        event: true
      },
      {
        param: "straightCount",
        operation: "*",
        change: 0.7,
        when: 0,
        event: true
      }
    ]
  },
  {
    id: 2,
    title: "Изменение алгоритма поисковой машины",
    description: "Падение трафика из органической выдачи в первый месяц после изменения на 50% восстановление трафика к 3-му месяцу на уровень первого месяца",
    dataChange: [{
        param: "organicCount",
        operation: "*",
        change: 0.5,
        when: 0,
        event: true
      },
      {
        param: "organicCount",
        operation: "*",
        change: 2,
        when: 2,
        event: true
      }
    ]
  },
  {
    id: 3,
    title: "Изменение подрядчика по контекстной рекламе",
    description: "Увеличение реальной стоимости привлечения клиента на 5%, увеличение конверсии от контекстной рекламы на 30%",
    dataChange: [{
        param: "realCostAttract",
        operation: "*",
        change: 1.05,
        when: 0,
        event: true
      },
      {
        param: "contextCoef",
        operation: "*",
        change: 1.3,
        when: 0,
        event: true
      }
    ]
  },
  {
    id: 4,
    title: "Ввод в эксплуатацию нового офисного здания рядом",
    description: "Увеличение трафика от канала прямого захода в первый месяц после этого в 3 раза и после этого во второй месяц увеличение конверсии в клиента на 5%",
    dataChange: [{
        param: "straightCount",
        operation: "*",
        change: 3,
        when: 1,
        event: true
      },
      {
        param: "conversion",
        operation: "*",
        change: 1.05,
        when: 2,
        event: true
      }
    ]
  },
  {
    id: 5,
    title: "Появление серии негативных публикаций о компании и руководителе компании",
    description: "Снижение конверсии трафика в звонки на 50%",
    dataChange: [{
        param: "organicCoef",
        operation: "*",
        change: 0.5,
        when: 0,
        event: true
      },
      {
        param: "socialsCoef",
        operation: "*",
        change: 0.5,
        when: 0,
        event: true
      },
      {
        param: "contextCoef",
        operation: "*",
        change: 0.5,
        when: 0,
        event: true
      },
      {
        param: "smmCoef",
        operation: "*",
        change: 0.5,
        when: 0,
        event: true
      },
      {
        param: "straightCoef",
        operation: "*",
        change: 0.5,
        when: 0,
        event: true
      }
    ]
  }
];
let cards = [{
    id: 1,
    title: "Нанять SMM-менеджера",
    text: "Описание карточки, описание карточки",
    cost: 80000,
    duration: 3,
    dataChange: [{
        param: "smmCount",
        operation: "*",
        change: 1.1,
        when: 2,
        from: "Нанять SMM-менеджера 2",
        id: 1
      },
      {
        param: "smmCount",
        operation: "*",
        change: 1.8,
        when: 3,
        from: "Нанять SMM-менеджера 3",
        id: 1
      },
      {
        param: "socialsCoef",
        operation: "*",
        change: 1.5,
        when: 3,
        from: "Нанять SMM-менеджера 3",
        id: 1
      }
    ]
  },
  {
    id: 2,
    title: "Заказать SEO-оптимизацию",
    text: "Описание карточки, описание карточки",
    cost: 50000,
    duration: 3,
    dataChange: [{
        param: "organicCount",
        operation: "*",
        change: 2,
        when: 3,
        from: "Заказать SEO-оптимизацию 3",
        id: 2
      },
      {
        param: "realCostAttract",
        operation: "*",
        change: 1.5,
        when: 1,
        from: "Заказать SEO-оптимизацию 1",
        id: 2
      },
      {
        param: "realCostAttract",
        operation: "*",
        change: 0.3,
        when: 3,
        from: "Заказать SEO-оптимизацию 3",
        id: 2
      }
    ]
  },
  {
    id: 3,
    title: "Улучшение юзабилити",
    text: "Описание карточки, описание карточки",
    cost: 20000,
    duration: 3,
    dataChange: [{
        param: "organicCoef",
        operation: "*",
        change: 1.1,
        when: 3,
        from: "Улучшение юзабилити 3",
        id: 3
      },
      {
        param: "contextCoef",
        operation: "*",
        change: 1.1,
        when: 3,
        from: "Улучшение юзабилити 3",
        id: 3
      },
      {
        param: "socialsCoef",
        operation: "*",
        change: 1.1,
        when: 3,
        from: "Улучшение юзабилити 3",
        id: 3
      },
      {
        param: "smmCoef",
        operation: "*",
        change: 1.1,
        when: 3,
        from: "Улучшение юзабилити 3",
        id: 3
      },
      {
        param: "straightCoef",
        operation: "*",
        change: 1.1,
        when: 3,
        from: "Улучшение юзабилити 3",
        id: 3
      },
      {
        param: "averageCheck",
        operation: "*",
        change: 1.5,
        when: 3,
        from: "Улучшение юзабилити 3",
        id: 3
      },
      {
        param: "realCostAttract",
        operation: "*",
        change: 0.8,
        when: 1,
        from: "Улучшение юзабилити 1",
        id: 3
      },
      {
        param: "realCostAttract",
        operation: "*",
        change: 0.8,
        when: 2,
        from: "Улучшение юзабилити 2",
        id: 3
      }
    ]
  },
  {
    id: 4,
    title: "Реклама в соцсетях",
    text: "Описание карточки, описание карточки",
    cost: 25000,
    duration: 3,
    dataChange: [{
        param: "socialsCount",
        operation: "+",
        change: 4500,
        when: 1,
        from: "Реклама в соцсетях 1",
        id: 4
      },
      {
        param: "realCostAttract",
        operation: "*",
        change: 1.1,
        when: 1,
        from: "Реклама в соцсетях 1",
        id: 4
      },
      {
        param: "realCostAttract",
        operation: "*",
        change: 1.1,
        when: 2,
        from: "Реклама в соцсетях 2",
        id: 4
      },
      {
        param: "realCostAttract",
        operation: "*",
        change: 1.1,
        when: 3,
        from: "Реклама в соцсетях 3",
        id: 4
      }
    ]
  },
  {
    id: 5,
    title: "PR-компания компании",
    text: "Описание карточки, описание карточки",
    cost: 30000,
    duration: 3,
    dataChange: [{
        param: "realCostAttract",
        operation: "*",
        change: 1.3,
        when: 1,
        from: "PR-компания компании 1",
        id: 5
      },
      {
        param: "averageCheck",
        operation: "*",
        change: 1.1,
        when: 2,
        from: "PR-компания компании 2",
        id: 5
      },
      {
        param: "averageCheck",
        operation: "*",
        change: 1.2,
        when: 3,
        from: "PR-компания компании 3",
        id: 5
      }
    ]
  },
  {
    id: 6,
    title: "Контекстная рекламная компания",
    text: "Описание карточки, описание карточки",
    cost: 35000,
    duration: 3,
    dataChange: [{
        param: "contextCount",
        operation: "+",
        change: 6000,
        when: 1,
        from: "Контекстная рекламная компания 1",
        id: 6
      },
      {
        param: "contextCount",
        operation: "*",
        change: 1.1,
        when: 2,
        from: "Контекстная рекламная компания 2",
        id: 6
      },
      {
        param: "contextCount",
        operation: "*",
        change: 1.2,
        when: 3,
        from: "Контекстная рекламная компания 3",
        id: 6
      },
      {
        param: "contextCoef",
        operation: "*",
        change: 1.5,
        when: 1,
        from: "Контекстная рекламная компания 1",
        id: 6
      },
      {
        param: "realCostAttract",
        operation: "*",
        change: 1.3,
        when: 1,
        from: "Контекстная рекламная компания 1",
        id: 6
      },
      {
        param: "realCostAttract",
        operation: "*",
        change: 1.3,
        when: 2,
        from: "Контекстная рекламная компания 2",
        id: 6
      },
      {
        param: "realCostAttract",
        operation: "*",
        change: 1.3,
        when: 3,
        from: "Контекстная рекламная компания 3",
        id: 6
      }
    ]
  },
  {
    id: 7,
    title: "Размещение информации о компании в справочниках",
    text: "Описание карточки, описание карточки",
    cost: 20000,
    duration: 3,
    dataChange: [{
        param: "straightCount",
        operation: "*",
        change: 1.2,
        when: 1,
        from: "Размещение информации о компании в справочниках 1",
        id: 7
      },
      {
        param: "straightCount",
        operation: "*",
        change: 1.2,
        when: 2,
        from: "Размещение информации о компании в справочниках 2",
        id: 7
      },
      {
        param: "straightCount",
        operation: "*",
        change: 1.2,
        when: 3,
        from: "Размещение информации о компании в справочниках 3",
        id: 7
      }
    ]
  }
];
/** ********************************************* **/
/** ******Ниже описаны события Socket.io********* **/
/** ********************************************* **/
io.on("connection", function (socket) {
  connections.push(socket.id);
  console.log("Подключения:");
  console.log(connections);

  socket.on("setName", name => {
    socket.name = name;
    let oldNote = connectedNames.find(element => element.id === socket.id);
    if (oldNote === undefined) {
      let person = {
        name,
        id: socket.id,
        roomId: -1,
        isAdmin: false
      };
      connectedNames.push(person);
    } else {
      oldNote.name = name;
      console.log(name + " изменено!");
    }
    console.log(connectedNames);
  });

  socket.on("newMessage", message => {
    socket.broadcast.to(socket.roomId).emit("addMessage", {
      name: socket.name,
      text: `${message}`
    });
  });

  socket.on("setRoom", roomId => {
    console.log("Установка пользователю комнаты №", roomId);
    let oldNote = connectedNames.find(element => element.id === socket.id);
    if (oldNote !== undefined) {
      oldNote.roomId = roomId;
      if (leaveUsers[roomId] !== undefined) {
        let leaveUserId = leaveUsers[roomId].findIndex(el => {
          return el.id === socket.id;
        });
        if (leaveUserId !== -1) {
          let sendObj = leaveUsers[roomId][leaveUserId];
          if (sendObj.isAdmin) {
            console.log('ADMIN!!!');
            socket.emit('setOwner')
          } else {
            console.log('Не админ', sendObj.isAdmin);
          }
          console.log(socket.id);
          console.log("Данные для отправки:", sendObj.data);
          socket.emit("setStartGame", sendObj.data);

          console.log("Имя пользователя: ", socket.name);
          let gamerObj = {
            id: socket.id,
            name: socket.name,
            data: sendObj.data,
            changes: sendObj.changes,
            effects: sendObj.effects,
            usedCards: sendObj.usedCards
          };
          socket.emit('setEffects', sendObj.effects);
          let room = roomsState.find(el => el.roomId === roomId);
          if (room !== undefined) {
            room.gamers.push(gamerObj);
            console.log("КОМНАТА");
            let gamerNames = [];
            room.gamers.forEach(el => {
              gamerNames.push({
                name: el.name,
                id: el.id,
                isattacker: false
              });
            });
            // gamerNames.push({
            //   name: socket.name,
            //   id: socket.id,
            //   isattacker: false
            // });
            let gamerNamesObj = {
              gamers: gamerNames
            };
            console.log(gamerNamesObj);
            socket.emit("setGamers", gamerNamesObj);
          } else {
            console.log("ЧТО-ТО НЕ ТАК!");
          }
        }
      }
      socket.join(roomId, () => {
        console.log(`Подключено к комнате #${roomId}`);
        console.log("Подключенные имена:");
        console.log(connectedNames);
        socket.roomId = roomId;
        socket.emit("setRoomNumber", roomId);
        io.sockets.to(roomId).emit("addMessage", {
          name: "Admin",
          text: `Игрок ${oldNote.name} подключён к комнате ${roomId}!`
        });
      });
    }
  });

  socket.on("createRoom", () => {
    let oldNote = connectedNames.find(element => element.id === socket.id);
    if (oldNote !== undefined) {
      oldNote.roomId = roomNumb;
      oldNote.isAdmin = true;
      console.log("Подключенные имена:");
      console.log(connectedNames);
      socket.roomId = roomNumb;
      socket.join(roomNumb, () => {
        console.log(`Создана комната #${roomNumb}`);
        socket.emit("setRoomNumber", roomNumb);
        roomNumb++;
      });
    }
  });

  socket.on("startGame", obj => {
    console.log("Приём");
    console.log(Object.assign(obj));
    let roomState = {};
    roomState.roomId = socket.roomId;
    roomState.roomState = obj;
    let gamerNames = [];
    if (io.sockets.adapter.rooms[socket.roomId] !== undefined) {
      console.log("Комнаты:");
      console.log(io.sockets.adapter.rooms[socket.roomId].sockets);
      let gamerIds = Object.keys(
        io.sockets.adapter.rooms[socket.roomId].sockets
      );
      let gamers = [];
      let attackers = 0;
      for (const id of gamerIds) {
        let findName;
        let nameFromConnected = connectedNames.find(el => el.id === id);
        if (nameFromConnected !== undefined) {
          findName = nameFromConnected.name;
          gamerNames.push({
            name: findName,
            id,
            isattacker: false
          });
        }

        attackers++;
        console.log(id + "---");

        let gamerObj = {
          id,
          name: findName,
          data: Object.assign({}, obj),
          changes: [],
          effects: [],
          usedCards: []
        };
        console.log("!!!!");
        console.log(gamerObj.data);
        gamers.push(gamerObj);
      }
      roomState.constAttackers = attackers;
      roomState.attackers = attackers;
      roomState.gamers = gamers;
      roomState.budgetPerMonth = obj.money;
      roomsState.push(roomState);
    }

    console.log("Стейт комнат: ");
    console.log(roomsState);
    let gamerNamesObj = {
      gamers: gamerNames
    };
    io.sockets.to(socket.roomId).emit("setGamers", gamerNamesObj);
    socket.to(socket.roomId).emit("setStartGame", obj);
  });

  // socket.on('typing', function () {
  //   socket.to(socket.roomId).broadcast.emit('addMessage');
  // });

  socket.on("kickUser", function (roomId, user) {
    console.log("Удаляем пользователя с ID ", roomId, "---", user);
    let room = roomsState.find(el => el.roomId === roomId);
    if (room) {
      let userIndex = room.gamers.findIndex(el => el.id === user.id);
      room.gamers.splice(userIndex, 1);
      io.sockets.to(user.id).emit("kickUser");
      let gamerNames = [];
      room.gamers.forEach(el => {
        gamerNames.push({
          name: el.name,
          id: el.id,
          isattacker: false
        });
      });
      let gamerNamesObj = {
        gamers: gamerNames
      };
      io.sockets.to(socket.roomId).emit("setGamers", gamerNamesObj);
      io.sockets.to(socket.roomId).emit("addMessage", {
        name: "Admin",
        text: `Из комнаты был удалён игрок с именем ${user.name}`
      });
      console.log(room);
      console.log(userIndex);
    }
  });

  socket.on("refreshSocketID", function (oldSocketId, roomId) {
    console.log("Refresh ID");
    console.log("Socket room ID", socket.roomId);
    let room = roomsState.find(el => el.roomId === roomId);
    console.log("Room", room);
    // let gamer;
    if (room !== undefined) {
      let refreshUser = disconnectedUsers.find(el => el.id === oldSocketId);
      if (refreshUser) {
        refreshUser.id = socket.id;
        console.log("REFRESH USER", refreshUser);
        room.gamers.push(refreshUser);
        let gamerNames = [];
        room.gamers.forEach(el => {
          gamerNames.push({
            name: el.name,
            id: el.id,
            isattacker: false
          });
        });
        let gamerNamesObj = {
          gamers: gamerNames
        };
        io.sockets.to(socket.roomId).emit("setGamers", gamerNamesObj);
      }
    } else {
      // io.sockets.to(socket.id).emit("resetData");
      io.sockets.to(socket.id).emit("addMessage", {
        name: "Admin",
        text: `Хочет перезагрузку`
      });
    }
  });

  socket.on("doStep", function (cardArr) {
    // если room.gamers!==undefined
    // Поиск комнаты
    let room = roomsState.find(el => el.roomId === socket.roomId);
    console.log("ИГРОКИ КОМНАТЫ", room.gamers);
    // Поиск игрока
    let gamer;
    if (room !== undefined) {
      // !!!!!!!!!!!!!!!!!Спорно!!!!!!!!!!!!!!
      gamer = room.gamers.find(el => el.id === socket.id);
    }
    if (gamer !== undefined) {
      let card;
      io.sockets.to(gamer.id).emit("addMessage", {
        name: "Admin",
        text: `Вы сделали ход!`
      });
      // Начало обработки пришедшего массива с ID карточек
      if (typeof gamer !== "undefined") {
        for (const effect of gamer.effects) {
          let cardArrIndex = cardArr.findIndex(elem => elem === effect.id);
          if (cardArrIndex === -1) {
            let effectIndex = gamer.effects.findIndex(
              elem => elem.id === effect.id
            );
            gamer.effects.splice(effectIndex, 1);
            // !!! добавление в !!!
            // Добавление в массив использованных карточек
            if (typeof gamer.usedCards[effect.id] === "undefined") {
              gamer.usedCards[effect.id] = 1;
            } else {
              gamer.usedCards[effect.id]++;
            }
            io.sockets.to(gamer.id).emit("addMessage", {
              name: "ТЕСТ",
              text: `вот ${gamer.usedCards[effect.id]}`
            });
          }
        }
      }
      if (cardArr.length !== 0) {
        // ДЛЯ ВСЕХ ЭФФЕКТОВ ИГРОКА
        for (const effect of gamer.effects) {
          // Если в пришедшем массиве нет уже существующего эффекта
          let cardArrIndex = cardArr.findIndex(elem => elem === effect.id);
          if (cardArrIndex === -1) {
            let effectIndex = gamer.effects.findIndex(
              elem => elem.id === effect.id
            );
            gamer.effects.splice(effectIndex, 1);
          }
          if (effect.step === effect.duration) {
            let effectIndex = gamer.effects.findIndex(
              elem => elem.id === effect.id
            );
            gamer.effects.splice(effectIndex, 1);
            console.log("Действие эффекта закончилось");
          } else {}
        }
        for (const cardId of cardArr) {
          console.log("------------------------------------");
          console.log(
            'Сделан шаг "' +
            cards.find(el => el.id === cardId).title +
            '" игроком ' +
            socket.name
          );
          card = cards.find(el => el.id === cardId);
          // ИЗМЕНЕНИЕ ОТ КАРТОЧКИ
          console.log("Массив карточек");
          gamer.data.money -= card.cost;

          // Если эффекта ещё нет (карточка выбрасывается первый раз)
          let effectIndex = gamer.effects.findIndex(elem => elem.id === cardId);
          if (cardId !== 3 && cardId !== 7) {
            if (effectIndex === -1) {
              // Занести свойства ещё не выброшенной серии
              for (const changes of card.dataChange) {
                let changeObj = {};
                for (var key in changes) {
                  changeObj[key] = changes[key];
                }
                gamer.changes.push(changeObj);
              }
              let effectObj = {
                id: cardId,
                name: card.title,
                step: 1,
                duration: card.duration
              };
              gamer.effects.push(effectObj);
            } else {
              // Если эффект существует в массиве
              gamer.effects[effectIndex].step++;
            }
          } else {
            if (effectIndex === -1) {
              // Занести свойства одноразовых карточек
              for (const changes of card.dataChange) {
                let changeObj = {};
                for (var k in changes) {
                  changeObj[k] = changes[k];
                }
                gamer.changes.push(changeObj);
              }
            }
          }

          console.log("-------------------------------------");
        } // Конец цикла обработки пришедших карт
      }
      let messageArr = [];
      let clients =
        (gamer.data.organicCount * gamer.data.organicCoef +
          gamer.data.contextCount * gamer.data.contextCoef +
          gamer.data.socialsCount * gamer.data.socialsCoef +
          gamer.data.smmCount * gamer.data.smmCoef +
          gamer.data.straightCount * gamer.data.straightCoef) *
        gamer.data.conversion;
      gamer.data.clients = Math.ceil(clients);
      console.log("Клиенты:");
      console.log(clients);
      let averageCheck = gamer.data.averageCheck;

      let realCostAttract = gamer.data.realCostAttract;

      let commCircul = clients * averageCheck;
      gamer.data.commCircul = commCircul;
      let expenses = clients * realCostAttract;
      gamer.data.expenses = expenses;
      let result = commCircul - expenses;
      gamer.data.money += room.budgetPerMonth;
      // console.log('Обновлён параметр money со знаком + на ' + Math.ceil(result))
      // messageArr.push('Обновлён параметр money со знаком + на ' + Math.ceil(result))
      let resultPerClient = result / clients;
      gamer.data.moneyPerClient = Math.ceil(resultPerClient);

      let iter = 0;
      let indexEffArr;
      for (let index = 0; index < gamer.changes.length; index++) {
        let changing = gamer.changes[index];
        indexEffArr = gamer.effects.findIndex(elem => elem.id === changing.id);
        console.log(
          "Для ID изменения " +
          changing.id +
          " индекс в м.эфф. равен " +
          indexEffArr
        );
        if (
          indexEffArr === -1 &&
          changing.id !== 3 &&
          changing.id !== 7 &&
          changing.event === undefined
        ) {
          for (let index = 0; index < gamer.changes.length; index++) {
            if (gamer.changes[index].id === changing.id) {
              console.log(
                "УДАЛЯЕТСЯ параметр " +
                changing.param +
                " со знаком " +
                changing.operation +
                " на " +
                changing.change +
                " (" +
                changing.from +
                ")"
              );
              messageArr.push(
                "УДАЛЯЕТСЯ параметр " +
                changing.param +
                " со знаком " +
                changing.operation +
                " на " +
                changing.change +
                " (" +
                changing.from +
                ")"
              );
              console.log("----!----");
              console.log(gamer.changes[index]);
              console.log("---- ----");
              gamer.changes.splice(index, 1);
              index--;
            }
          }
        }
        // ***********************************************************************
        if (changing.when === 1) {
          console.log("*****************************************************");
          console.log(changing);
          console.log("*****************************************************");
          if (
            gamer.effects.findIndex(elem => elem.id === changing.id) !== -1 ||
            changing.id === 3 ||
            changing.id === 7 ||
            changing.event
          ) {
            if (
              gamer.usedCards[changing.id] < 1 ||
              typeof gamer.usedCards[changing.id] === "undefined"
            ) {
              switch (changing.operation) {
                case "+":
                  gamer.data[changing.param] += changing.change;
                  break;
                case "-":
                  gamer.data[changing.param] -= changing.change;
                  break;
                case "*":
                  gamer.data[changing.param] *= changing.change;
                  break;
                default:
                  console.log(
                    "Что-то не так с операцией карточки по ID " + card.id
                  );
                  messageArr.push(
                    "Что-то не так с операцией карточки по ID " + card.id
                  );
                  break;
              }
            } else {
              switch (changing.operation) {
                case "+":
                  gamer.data[changing.param] +=
                    changing.change / Math.pow(2, gamer.usedCards[changing.id]);
                  break;
                case "-":
                  gamer.data[changing.param] -=
                    changing.change / Math.pow(2, gamer.usedCards[changing.id]);
                  break;
                case "*":
                  gamer.data[changing.param] *=
                    changing.change / Math.pow(2, gamer.usedCards[changing.id]);
                  break;
                default:
                  console.log(
                    "Что-то не так с операцией карточки по ID " + card.id
                  );
                  messageArr.push(
                    "Что-то не так с операцией карточки по ID " + card.id
                  );
                  break;
              }
            }
            let analyticsString = "Обновлён  ";
            switch (changing.param) {
              case "organicCount":
                analyticsString += 'параметр "Органика"';
                break;
              case "contextCount":
                analyticsString += 'параметр "Реклама: контекст"';
                break;
              case "socialsCount":
                analyticsString += 'параметр "Реклама: соцсети"';
                break;
              case "smmCount":
                analyticsString += 'параметр "Соц. медиа"';
                break;
              case "straightCount":
                analyticsString += 'параметр "Прямой заход"';
                break;

              default:
                analyticsString += "параметр " + changing.param;
                break;
            }
            if (gamer.usedCards[changing.id] >= 1) {
              analyticsString +=
                " со знаком " +
                changing.operation +
                " на " +
                changing.change / Math.pow(2, gamer.usedCards[changing.id]) +
                " (" +
                changing.from +
                ")";
            } else {
              analyticsString +=
                " со знаком " +
                changing.operation +
                " на " +
                changing.change +
                " (" +
                changing.from +
                ")";
            }
            console.log(analyticsString);
            messageArr.push(analyticsString);
            let indForDelete = gamer.changes.findIndex(elem => {
              return (
                elem.id === changing.id &&
                elem.change === changing.change &&
                elem.param === changing.param
              );
            });
            if (indForDelete !== -1) {
              // console.log('Удалилась позиция ' + indForDelete)
              // gamer.changes.splice(indForDelete, 1)
            }
          } else {
            // console.log('УДАЛЁН параметр ' + changing.param + ' со знаком ' + changing.operation + ' на ' + changing.change)
            // messageArr.push('УДАЛЁН параметр ' + changing.param + ' со знаком ' + changing.operation + ' на ' + changing.change)
            for (let index = 0; index < gamer.changes.length; index++) {
              if (gamer.changes[index].id === changing.id) {
                messageArr.push(
                  "УДАЛЁН параметр " +
                  changing.param +
                  " со знаком " +
                  changing.operation +
                  " на " +
                  changing.change
                );
                console.log(
                  "УДАЛЁН параметр " +
                  changing.param +
                  " со знаком " +
                  changing.operation +
                  " на " +
                  changing.change
                );
                gamer.changes.splice(index, 1);
              }
            }
          }
          gamer.changes.splice(iter, 1);
        } else {
          iter++;
        }
      }

      console.log("ИЗМЕНЕНИЯ ИГРОКА");
      console.log(gamer.changes);
      // Конец обработки пришедшего массива

      let gamers = roomsState.find(el => el.roomId === socket.roomId).gamers;
      console.log("~~~~~gamers~~~~~~");
      console.log(gamers);
      io.sockets.to(socket.roomId).emit("changeGamerStatus", socket.id);
      room.attackers--;
      console.log("*");
      console.log("*");
      console.log("*");
      console.log("АТАКУЮЩИЕ");
      console.log(room.attackers);
      console.log("СОХРАНЁННЫЕ АТАКУЮЩИЕ");
      console.log(room.constAttackers);
      console.log("Игроки без хода: " + room.attackers);
      if (messageArr.length !== 0) {
        for (let index = 0; index < messageArr.length; index++) {
          io.sockets.to(gamer.id).emit("addMessage", {
            name: "ОТДЕЛ АНАЛИТИКИ",
            text: messageArr[index]
          });
        }
        messageArr = [];
      }

      // Если все в комнате завершили ход
      if (room.attackers === 0) {
        room.roomState.month--;
        console.log(room.roomState.month);
        console.log("Обновление данных для ВСЕХ");
        setTimeout(() => {
          if (
            Math.floor(Math.random() * 10) % 2 === 0 &&
            room.roomState.month > 0
          ) {
            let randomEvent = events[Math.floor(Math.random() * events.length)];
            console.log("Событие");
            console.log(randomEvent);
            for (const eventChange of randomEvent.dataChange) {
              if (eventChange.when === 0) {
                for (const gamerPos of gamers) {
                  switch (eventChange.operation) {
                    case "+":
                      gamerPos.data[eventChange.param] += eventChange.change;
                      break;
                    case "-":
                      gamerPos.data[eventChange.param] -= eventChange.change;
                      break;
                    case "*":
                      gamerPos.data[eventChange.param] *= eventChange.change;
                      break;
                    default:
                      console.log("Что-то не так с событием " + card.id);
                      break;
                  }
                }
                console.log(
                  "Событием изменен параметр " +
                  eventChange.param +
                  " со знаком " +
                  eventChange.operation +
                  " на " +
                  eventChange.change
                );
              } else {
                for (const oneGamer of gamers) {
                  oneGamer.changes.push(eventChange);
                }
              }
            }
            socket.emit("gameEvent");
            io.sockets.to(room.roomId).emit("gameEvent", randomEvent);
            io.sockets.to(room.roomId).emit("addMessage", {
              name: "СОБЫТИЕ!",
              text: `${randomEvent.description}`
            });
          }
          for (const gamerUser of gamers) {
            io.sockets.to(gamerUser.id).emit("setStartGame", gamerUser.data);
          }
          socket.emit("doNextStep");
          io.sockets.to(socket.roomId).emit("doNextStep");
          room.attackers = room.constAttackers;
        }, 1000);
      }
      // СЮДА

      for (let index = 0; index < gamer.changes.length; index++) {
        const changing = gamer.changes[index];
        changing.when--;
        if (changing.when < 1) {
          gamer.changes.splice(index, 1);
          index--;
        }
      }

      console.log("Месяц:");
      console.log(gamer.data.month);
      gamer.data.month--;
      if (room.roomState.month === 0) {
        for (const gamer of gamers) {
          io.sockets.to(gamer.id).emit("setStartGame", gamer.data);
        }
        let gamersRate = [];
        for (const gamer of gamers) {
          let position = {
            id: gamer.id,
            money: (Math.ceil(
                  gamer.data.organicCount *
                  gamer.data.organicCoef *
                  gamer.data.conversion
                ) +
                Math.ceil(
                  gamer.data.contextCount *
                  gamer.data.contextCoef *
                  gamer.data.conversion
                ) +
                Math.ceil(
                  gamer.data.socialsCount *
                  gamer.data.socialsCoef *
                  gamer.data.conversion
                ) +
                Math.ceil(
                  gamer.data.smmCount *
                  gamer.data.smmCoef *
                  gamer.data.conversion
                ) +
                Math.ceil(
                  gamer.data.straightCount *
                  gamer.data.straightCoef *
                  gamer.data.conversion
                )) *
              gamer.data.averageCheck
          };
          gamersRate.push(position);
        }
        gamersRate.sort((a, b) => {
          if (a.money > b.money) {
            return -1;
          } else if (a.money < b.money) {
            return 1;
          }
          return 0;
        });
        console.log("Рейтинг игроков:");
        console.log(gamersRate);
        let winners = {};
        for (let index = 1; index < 4; index++) {
          let a = gamersRate.shift();
          if (typeof a !== "undefined") {
            winners[index] = Object.assign(a);
            let person = connectedNames.find(el => el.id === a.id);
            if (typeof person !== "undefined") {
              winners[index].name = person.name;
            }
          } else winners[index] = a;
        }
        console.log(winners);
        io.sockets.to(room.roomId).emit("addMessage", {
          name: "Admin",
          text: `Финито ля комедиа!`
        });

        io.sockets.to(room.roomId).emit("finish", winners);
      } else {}
      console.log("---ДАННЫЕ ИГРОКА---");
      console.log(gamer.data);
      console.log("---ЭФФЕКТЫ ИГРОКА---");
      console.log(gamer.effects);
      for (const gamer of gamers) {
        io.sockets.to(gamer.id).emit("setEffects", gamer.effects);
      }
    } else {
      console.log("NEED USER DATA!");
      let room = roomsState.find(el => el.roomId === socket.roomId);
      // Поиск игрока
      // let gamer = room.gamers.find(el => el.id === socket.id);
      console.log("ROOM", room);
      console.log("GAMERS", room.gamers);
      console.log("SOCKETID", socket.id);
      io.sockets.to(socket.id).emit("needUserData");
    }
  });

  socket.on("leaveRoom", function () {
    console.log(`${socket.name} уходит с комнаты!`);
    let oldNote = connectedNames.find(element => element.id === socket.id);
    if (oldNote !== undefined) {
      oldNote.roomId = -1;
      socket.emit("setRoomNumber", -1);
    }
    for (let index = 0; index < roomsState.length; index++) {
      let gamerThereIndex = roomsState[index].gamers.findIndex(
        el => el.id === socket.id
      );
      if (gamerThereIndex !== -1) {
        console.log(
          "Уходит, объект: ",
          roomsState[index].gamers[gamerThereIndex]
        );
        roomsState[index].gamers[gamerThereIndex].isAdmin = oldNote.isAdmin
        // eslint-disable-next-line valid-typeof
        if (typeof leaveUsers[socket.roomId] !== "array") {
          leaveUsers[socket.roomId] = [];
          leaveUsers[socket.roomId].push(
            roomsState[index].gamers[gamerThereIndex]
          );
          console.log(leaveUsers);
        } else {
          leaveUsers[socket.roomId].push(
            roomsState[index].gamers[gamerThereIndex]
          );
        }
        roomsState[index].gamers.splice(gamerThereIndex, 1);
      }
    }
    console.log("Подключенные имена:");
    console.log(connectedNames);
  });

  socket.on("checkRoom", function (id) {
    console.log(`Поиск комнаты с номером ${id}`);
    console.log(connectedNames);
    let check = false;
    setTimeout(() => {
      for (const gamer of connectedNames) {
        console.log("gamer:");
        console.log(gamer);
        console.log(gamer.roomId);
        if (+gamer.roomId === +id) {
          check = true;
          console.log(`Комната найдена`);
          break;
        }
      }
      if (!check) {
        console.log(`Комната не найдена`);
        socket.emit("roomNotFound");
      }
    }, 200);
  });

  socket.on("disconnect", function () {
    this.messageArr = [];
    connections.splice(connections.indexOf(socket.id), 1);
    let oldNote = connectedNames.findIndex(element => element.id === socket.id);
    if (oldNote !== -1) {
      if (connectedNames[oldNote].roomId !== -1) {
        io.sockets.to(socket.roomId).emit("addMessage", {
          name: "Admin",
          text: `Игрок ${connectedNames[oldNote].name} вышел из игры!`
        });
      }
    }
    connectedNames.splice(oldNote, 1);
    console.log("Подключения:");
    console.log(connections);
    console.log("Подключенные имена:");
    console.log(connectedNames);
    console.log(`${socket.name} уходит с комнаты!`);
    for (let index = 0; index < roomsState.length; index++) {
      let gamerThereIndex = roomsState[index].gamers.findIndex(
        el => el.id === socket.id
      );
      if (gamerThereIndex !== -1) {
        disconnectedUsers.push(roomsState[index].gamers[gamerThereIndex]);
        console.log("DISCONNECTED");
        console.log(disconnectedUsers);
        roomsState[index].gamers.splice(gamerThereIndex, 1);
      }
    }
  });
});
