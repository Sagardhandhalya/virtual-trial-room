import { useSyncExternalStore } from "react";

let store = {
  name: "sagar",
  phone: "9081606040",
};

let updateStore = null;

const getSnapShot = () => {
  return store;
};

const subscribe = (notify: any) => {
  console.log(notify);
  updateStore = notify;
};

const HookDemo = () => {
  const data = useSyncExternalStore(subscribe, getSnapShot);
  console.log(data);

  const updatePhone = () => {
    const newStore = { ...store, phone: "122" };
    store = newStore;

    updateStore();
  };

  return (
    <div>
      <h1>Cool</h1>
      <p>{JSON.stringify(data)}</p>
      <button onClick={updatePhone}>update</button>
    </div>
  );
};

export default HookDemo;
