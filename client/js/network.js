class Network {
  constructor() {
    this.ws = null;
    this.listeners = {};
  }

  connect(host) {
    this.ws = new WebSocket(host);

    this.ws.onopen = () => {
      this.emit('connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        this.emit(msg.type, msg);
      } catch (e) {
        console.error('Parse error:', e);
      }
    };

    this.ws.onclose = () => {
      this.emit('disconnected');
    };

    this.ws.onerror = () => {};
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  join(name) {
    this.send({ type: 'join', name });
  }

  sendInput(dx, dy) {
    this.send({ type: 'input', dx, dy });
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    const cbs = this.listeners[event];
    if (cbs) {
      for (const cb of cbs) cb(data);
    }
  }

  close() {
    if (this.ws) this.ws.close();
  }
}
