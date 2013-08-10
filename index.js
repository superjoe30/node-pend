module.exports = Pend;

function Pend() {
  this.pending = 0;
  this.max = Infinity;
  this.listeners = [];
  this.waiting = [];
  this.error = null;
}

Pend.prototype.go = function(fn) {
  if (this.pending < this.max) {
    pendGo(this, fn);
  } else {
    this.waiting.push(fn);
  }
};

Pend.prototype.wait = function(cb) {
  if (this.pending === 0) {
    cb(this.error);
  } else {
    this.listeners.push(cb);
  }
};

function pendGo(self, fn) {
  self.pending += 1;
  fn(onCb);
  function onCb(err) {
    self.error = self.error || err;
    self.pending -= 1;
    if (self.pending < 0) throw new Error("Callback called twice.");
    if (self.waiting.length > 0 && self.pending < self.max) {
      pendGo(self, self.waiting.shift());
    } else if (self.pending === 0) {
      self.listeners.forEach(cbListener);
      self.listeners = [];
    }
  }
  function cbListener(listener) {
    listener(self.error);
  }
}
