
class Player {
  constructor({x, y, score, id}) {
    this.id = id;
    this.score = score;
    this.x = x;
    this.y = y;
    this.dimensions = 5;
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
    let hitsX  = false;
    let hitsY = false;
    for (let i = 0; i < this.dimensions; i++) {
      for (let j = 0; j < item.dimensions; j++) {
        if (this.x + i === item.x + j) {
          hitsX = true;
        }
        if (this.y + i === item.y + j) {
          hitsY = true;
        }
      }
    }
    if (hitsX && hitsY) {
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
