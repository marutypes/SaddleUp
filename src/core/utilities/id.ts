export function getIdFactory() {
  let currentId = 1;
  return function nextId() {
    currentId++;
    return currentId;
  };
}
