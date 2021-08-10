new Vue({
  el: "#battle",
  data() {
    return {
      gameRunning: true,
      currentPlayerIndex: 0,
      currentEnemyIndex: 0,
      acting: false,
      youWin: false,
      youLose: false,
      heroCallout: false,
      heroCalloutTriggered: false,
      currentTurn: "players",
      hoveredPlayer: false,
      names: ["Hero1","Hero2","Hero3","Hero4","Hero5","Hero6","Hero7","Hero8","Hero9","Hero10","Hero1","Hero11","Hero12","Hero13","Hero14","Hero15","Hero16","Hero17",],
      magic: ["heal","healAll","flame","freeze",'freezeAll'],
      players: [
      {
        type: "player",
        name: "Hero",
        startHP: 200,
        currentHP: 200,
        strength: 65,
        int: 35,
        isDefending: false,
        living: true,
        healing: false,
        healed: false,
        hit: false,
        magic: "flameAll" },

      {
        type: "player",
        name: "Big Hero",
        startHP: 100,
        currentHP: 100,
        strength: 30,
        int: 80,
        isDefending: false,
        living: true,
        healing: false,
        healed: false,
        hit: false,
        magic: "heal" }],


      enemies: [
      {
        type: "enemy",
        name: "Bad Boy",
        startHP: 300,
        currentHP: 300,
        strength: 70,
        int: 30,
        magic: 'blitzkreig',
        announce: false,
        living: true,
        enraged: false,
        hit: false,
        flaming: false }] };
  },
  watch: {
    currentTurn(val) {
      if (val == "enemies") {
        if (!this.livingEnemies.length) return this.youWin = true;
        this.increment("enemies");
        if (this.currentEnemy.frozen) {
          this.currentEnemy.frozen = false;
          this.players.forEach(player => player.healing = false);
          return this.switchTurns();
        }
        setTimeout(() => {
          this.players.forEach(player => player.healing = false);
          this.enemyAttack();
        }, 500);

        this.livingEnemies.forEach(enemy => {
          if (enemy.flaming) {
            let amt = parseInt(enemy.flaming / 3);
            if (amt > enemy.currentHP) amt = enemy.currentHP - 1;
            this.takeDamage(enemy, amt);
          }
        });
        if (this.currentEnemy.living) this.resetUnit(this.currentEnemy);
      }
      if (val === "players") {
        this.acting = false;
        if (!this.livingPlayers.length) return this.youLose = true;
        //hero ekle
        if (!this.heroCalloutTriggered && this.heroHPRatio < 40) {
          this.heroCallout = true;} 
        else {
          this.heroCallout = false;
        }

        this.increment("players");
        this.resetUnit(this.currentPlayer);
      }} },
  methods: {
    reset() {
      this.youLose = false;
      this.youWin = false;
      this.players.forEach(player => {
        player.currentHP = player.startHP;
        player.living = true;
      });
      this.enemies.forEach(enemy => {
        this.resetUnit(enemy);
        enemy.currentHP = enemy.startHP;
      });
      this.currentTurn = "players";
      this.currentPlayerIndex = 0;
    },
    currentHPPct(entity) {return entity.currentHP * 100 / entity.startHP;},
    heroCalledOut() {
      this.heroCalloutTriggered = true;
      this.heroCallout = false;
    },
    gameOn() {
      this.gameRunning = !this.gameRunning;
    },
    attack() {
      if (this.acting) return false;
      this.acting = true;
      var max = this.currentPlayer.strength;
      var min = this.currentPlayer.strength / 10;
      var target = this.livingEnemies[
      Math.floor(Math.random() * this.livingEnemies.length)];

      var damage = parseInt(Math.random() * (max - min) + min);

      this.takeDamage(target, damage);
       console.log(this.currentPlayer.name, 'did ', damage, ' to ', target.name);
      setTimeout(() => {
        this.switchTurns();
      }, 500);
    },
    castSpell(spell) {
      let _this = this;
      _this[spell].call();
    },
    heal() {
      if (this.acting) return false;
      this.acting = true;
      var max = this.currentPlayer.int;
      var min = 5;
      var target = this.livingPlayers.reduce((ov, nv) => {
        var pct = nv.currentHP / nv.startHP,
        opct = ov.currentHP / ov.startHP;
        return pct > opct ? ov : nv;
      });

      var amt = parseInt(Math.random() * (max - min) + min);
       console.log('heal', this.livingPlayers.length, target)
      target.healing = true;
      this.takeDamage(target, -amt);

       console.log('healed ', target.name, amt);
      setTimeout(() => {
        this.switchTurns();
      }, 500);
    },

    healAll() {
      if (this.acting) return false;
      this.acting = true;
      var max = this.currentPlayer.int;
      var min = 5;

      this.livingPlayers.forEach(player => {
        let max = this.currentPlayer.int / 2;
        let min = 5;

        var amt = parseInt(Math.random() * (max - min) + min);

        player.healing = true;
        this.takeDamage(player, -amt);
      });

      setTimeout(() => {
        this.switchTurns();
      }, 500);
    },

    flame() {
      if (this.acting) return false;
      this.acting = true;

      var target = this.livingEnemies[
      Math.floor(Math.random() * this.livingEnemies.length)];


      let max = this.currentPlayer.int;
      let min = 5;

      var amt = parseInt(Math.random() * (max - min) + min);

      this.takeDamage(target, amt);

      target.frozen = false;
      target.flaming = amt;

      setTimeout(() => {
        this.switchTurns();
      }, 500);
    },
    blitzkreig(caster, targetGroup) {
      this.acting = true;
      console.log(targetGroup);
      targetGroup.forEach(target => {
        let max = caster.int,
        min = 5;

        var amt = parseInt(Math.random() * (max - min) + min);
        console.log(target.name + ' hit for ' + amt);
        this.takeDamage(target, amt);
      });

    },
    freeze() {
      if (this.acting) return false;
      this.acting = true;
      var target = this.livingEnemies[
      Math.floor(Math.random() * this.livingEnemies.length)];
      let max = this.currentPlayer.int;
      let min = 5;
      var amt = parseInt(Math.random() * (max - min) + min);
      this.takeDamage(target, amt);
      target.flaming = false;
      target.frozen = true;
      setTimeout(() => {
        this.switchTurns();
      }, 500);
    },
    flameAll() {
      if (this.acting) return false;
      this.acting = true;

      this.livingEnemies.forEach(enemy => {
        let max = this.currentPlayer.int / 2;
        if (max <= 5) max = 6;
        let min = 5;

        var amt = parseInt(Math.random() * (max - min) + min);

        this.takeDamage(enemy, amt);
        enemy.frozen = false;
        enemy.flaming = amt;
      });

      setTimeout(() => {
        this.switchTurns();
      }, 500);
    },

    freezeAll() {
      if (this.acting) return false;
      this.acting = true;

      this.livingEnemies.forEach(enemy => {
        let max = this.currentPlayer.int / 3;
        if (max <= 5) max = 6;
        let min = 5;

        var amt = parseInt(Math.random() * (max - min) + min);

        this.takeDamage(enemy, amt);
        enemy.flaming = false;
        enemy.frozen = true;
      });

      setTimeout(() => {
        this.switchTurns();
      }, 500);
    },
    defend() {
      if (this.acting) return false;
      this.acting = true;
      this.currentPlayer.isDefending = true;
      setTimeout(() => {
        this.switchTurns();
      }, 500);
    },
    run() {},
    enemyAttack() {
      if (!this.currentEnemy) this.currentEnemy = this.livingEnemies[0];
      let chanceOfMagic = this.currentEnemy.magic && Math.random() - .5 > this.currentEnemy.currentHP / this.currentEnemy.startHP;

      if (chanceOfMagic) {
        console.log('Blitzkreig!');
        let caster = this.currentEnemy;
        caster.announce = 'Blitzkreig!';
        this.blitzkreig(caster, this.livingPlayers);
        setTimeout(() => {
          caster.announce = false;
        }, 1500);
      } else {

        var max = this.currentEnemy.strength;
        if (this.currentEnemy.enraged) max *= 3;
        var min = 1;
        var damage = parseInt(Math.random() * (max - min) + min);
        var target = this.livingPlayers[
        Math.floor(Math.random() * this.livingPlayers.length)];


        this.takeDamage(target, damage);
      } console.log(this.currentEnemy.name, ' did ', damage, ' to ', target.name);
      setTimeout(() => {
        this.currentEnemy.enraged = false;
        this.switchTurns();
      }, 500);
    },

    addBadguy() {
      if (this.enemies.length >= 7) return;
      var randomHP = 60 + Math.floor(Math.random() * 100);
      var badGuy = {
        type: "enemy",
        name: "minion",
        startHP: randomHP,
        currentHP: randomHP,
        strength: 30 + Math.floor(Math.random() * 30),
        living: true,
        enraged: false,
        hit: false };

      this.enemies.push(badGuy);
    },

    addGoodguy() {
      if (this.players.length >= 6) return;
      this.heroCalledOut();
      var randHP = 80 + parseInt(170 * Math.random());
      var randIndex = Math.floor(Math.random() * this.names.length);
      var randSpellIndex = Math.floor(Math.random() * this.magic.length);
      var name = this.names[randIndex];
      var spell = this.magic[randSpellIndex];
      this.names.splice(randIndex, 1);
      var goodGuy = {
        type: "player",
        name,
        currentHP: randHP,
        startHP: randHP,
        strength: 10 + Math.floor(Math.random() * 100),
        int: 10 + Math.floor(Math.random() * 100),
        isDefending: false,
        living: true,
        healing: false,
        healed: false,
        magic: spell };

      this.players.push(goodGuy);
    },

    takeDamage(unit, actualAmount) {
      const amt = actualAmount > 0 && unit.isDefending ?
      Math.floor(actualAmount / 4) :
      actualAmount;
      unit.currentHP -= amt;

      if (amt > 0) {
        unit.hit = parseInt(amt);
      } else {
        unit.healed = 0 - parseInt(amt);
      }

      setTimeout(() => {
        unit.hit = false;
        unit.healed = false;
      }, 500);

      if (unit.currentHP > unit.startHP) unit.currentHP = unit.startHP;
      if (unit.currentHP <= 0) {
        unit.currentHP = 0;
        unit.living = false;
        if (unit.type === "player") {
          this.livingEnemies.forEach(enemy => {
            var healUp = parseInt((enemy.startHP - enemy.currentHP) / 2);
            enemy.healed = -healUp;
            enemy.currentHP += healUp;

            setTimeout(() => {
              enemy.healed = false;
            }, 500);
          });
          var randBaddie = this.enemies[
          Math.floor(Math.random() * this.enemies.length)];

          if (!randBaddie.living) {
            randBaddie.living = true;
            randBaddie.flaming = false;
            randBaddie.enraged = false;
            randBaddie.frozen = false;
            randBaddie.currentHP = parseInt(randBaddie.startHP / 2);
            randBaddie.healed = parseInt(randBaddie.startHP / 2);
            setTimeout(() => {
              randBaddie.healed = false;
            }, 500);
          }
        } else {
          unit.enraged = false;
          unit.flaming = false;
          unit.frozen = false;
          this.livingPlayers.forEach(player => {
            var healUp = parseInt((player.startHP - player.currentHP) / 2);
            player.healed = -healUp;
            player.currentHP += healUp;
            setTimeout(() => {
              player.healed = false;
            }, 500);
          });
          var randGoodie = this.players[
          Math.floor(Math.random() * this.players.length)];

          if (!randGoodie.living) {
            randGoodie.living = true;
            randGoodie.currentHP = parseInt(randGoodie.startHP / 2);
            randGoodie.healed = parseInt(randGoodie.startHP / 2);
            setTimeout(() => {
              randGoodie.healed = false;
            }, 500);
          }
        }
      } else {
        if (unit.type === "enemy") {
          var rageLevel = 100 - 100 * unit.currentHP / unit.startHP;
          if (rageLevel * Math.random() > 30) unit.enraged = true;
        }
      }
    },

    resetUnit(unit) {
      unit.flaming = false;
      unit.isDefending = false;
      unit.living = true;
      unit.enraged = false;
      unit.frozen = false;
    },
    increment(team) {
      if (team === "players") {
        this.currentPlayerIndex++;
        if (this.currentPlayerIndex >= this.livingPlayers.length) {
          this.currentPlayerIndex = 0;
        }
      } else {
        this.currentEnemyIndex++;
        if (this.currentEnemyIndex >= this.livingEnemies.length) {
          this.currentEnemyIndex = 0;
        }
      }
    },
    switchTurns() {
      if (this.currentTurn === "players") {
        this.currentTurn = "enemies";
      } else {
        this.currentTurn = "players";
      }
    },

    hoverPlayer(unit) {
      this.hoveredPlayer = unit;
    },
    unhoverPlayer() {
      this.hoveredPlayer = false;
    } },
  computed: {
    currentPlayer() {
      return this.livingPlayers[this.currentPlayerIndex];
    },
    currentEnemy() {
      return this.livingEnemies[this.currentEnemyIndex];
    },
    livingPlayers() {
      var newArr = this.players.filter(player => {
        return player.living;
      });
      console.log('living players:')
      return newArr;
    },
    livingEnemies() {
      return this.enemies.filter(enemy => {
        return enemy.living;
      });
    },
    heroHPRatio() {
      let total = 0,
      current = 0;
      this.livingPlayers.forEach(player => {
        total += player.startHP;
        current += player.currentHP;
      });
      return current * 100 / total;
    } } });

