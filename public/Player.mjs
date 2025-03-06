class Player {
  constructor({x, y, score, id}) {
    this.id = id;
    this.score = score;
    this.x = x;
    this.y = y;

  }

  movePlayer(dir, speed) {
    switch(dir) {
      case 'up':
        this.y += speed;
        break;
      case 'down':
        this.y -= speed;
        break;
      case 'right':
        this.x += speed;
        break;
      case 'left':
        this.x -= speed;
        break;
    }
  }

  collision(item) {
    if (this.x === item.x && this.y === item.y) {
      return true;
    } else {
      return false;
    }
  }

  calculateRank(arr) {
    let rank = 1;
    const totalPlayers = arr.length;
    for (let i = 0; i < totalPlayers; i++) {
      if (arr[i].score > this.score) {
        rank++;
      }
    }
    return `Rank: ${rank}/${totalPlayers}`;
  }
}

export default Player;
