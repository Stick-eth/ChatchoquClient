# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Room parameters

When the user is the host of a room, additional settings can be tuned before starting the game:

- **Rounds** – slider between 5 and 50 (step of 5, default 10)
- **Messages per round** – slider between 1 and 10
- **Only GIFs** – toggle button
- **Pav-o-meter** – slider between 3 and 1024 controlling the minimum message length

Once configured, these values are sent with the `startGame` socket event. On the server side implement a listener:

```js
io.on('connection', (socket) => {
  socket.on('startGame', ({ rounds, messagesPerRound, onlyGifs, minMessageLength }) => {
    // Start the game with the given settings
  });
});
```

## Player departures

When a participant leaves the lobby before the game has started, the server emits a
`playerLeft` event to everyone still in the room. Its payload contains the pseudo of the
departing player so that clients can update their local list:

```javascript
socket.on('playerLeft', ({ pseudo }) => {
  console.log(pseudo, 'left the room');
});
```
