export const deleteMessage = (messages) => {
  const removeIndex = messages.findIndex((message) => {
    return (message.message === 'restart' && message.type === 'log')});
  return [
    ...messages.slice(0, removeIndex),
    ...messages.slice(removeIndex + 1),
  ];
};

export const deleteTypingMessage = (messages) => {
  const removeIndex = messages.findIndex((message) => {
    return (message.data === 'typing' && message.type === 'log')});
  return [
    ...messages.slice(0, removeIndex),
    ...messages.slice(removeIndex + 1),
  ];
};