import { useContext, useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { UserContext } from "./UserContext";
import { uniqBy } from "lodash";
import axios from "axios";
import Profile from "./Profile";

export default function Chat() {
  const [ws, setWs] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [offlineUsers, setOfflineUsers] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const { username, id, setId, setUsername } = useContext(UserContext);
  const underTheMessages = useRef();

  useEffect(() => {
    connectToWs();
  }, []);

  function connectToWs() {
    const ws = new WebSocket("ws://localhost:3002");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => connectToWs());
  }

  function showOnlineUsers(onlineArray) {
    const online = {};
    onlineArray.forEach((person) => {
      online[person.userId] = person.username;
    });
    setOnlineUsers(online);
  }
  
  function handleMessage(ev) {
    const msgData = JSON.parse(ev.data);
    if ("online" in msgData) {
      showOnlineUsers(msgData.online);
    } else if ("text" in msgData) {
      setMessages((prev) => [...prev, { ...msgData }]);
    }
  }

  function sendMessage(ev) {
    ev.preventDefault();
    ws.send(
      JSON.stringify({
        recipient: selectedUser,
        text: newMessageText,
      })
    );
    setNewMessageText("");
    setMessages((prev) => [
      ...prev,
      {
        text: newMessageText,
        sender: id,
        recipient: selectedUser,
        _id: Date.now(),
      },
    ]);
  }

  function logout() {
    axios.post('/logout').then(() => {
      setWs(null);
      setId(null);
      setUsername(null);
    });
  }

  useEffect(() => {
    const div = underTheMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  useEffect(() => {
    axios.get("/users").then((res) => {
      const offlineArray = res.data
        .filter((p) => p._id !== id)
        .filter((p) => !Object.keys(onlineUsers).includes(p._id));
      const offlineUsers = {};
      offlineArray.forEach((p) => {
        offlineUsers[p._id] = p;
      });
      setOfflineUsers(offlineUsers);
    });
  }, [onlineUsers]);

  useEffect(() => {
    if (selectedUser) {
      axios.get("/messages/" + selectedUser).then((res) => {
        setMessages(res.data);
      });
    }
  }, [selectedUser]);

  const otherUsers = { ...onlineUsers };
  delete otherUsers[id];
  const filteredMsg = uniqBy(messages, "_id");

  return (
    <div className="w-screen h-screen animate-background bg-gradient-to-tr from-[rgb(62,52,107)] via-[#2d4755] to-[#29698C] flex items-center">
      <div className="w-full h-full mx-auto flex md:py-6 xl:px-40 lg:px-10 md:px-10 sm:p-0 ">
        <div className="bg-blue-50 w-1/3 flex-col relative">
          <div className="flex-grow">
            <Logo />
            {Object.keys(otherUsers).map((userId) => (
              <Profile
                key={userId}
                userId={userId}
                username={otherUsers[userId]}
                onClick={() => setSelectedUser(userId)}
                selected={selectedUser === userId}
                online={true}
              />
            ))}
            {Object.keys(offlineUsers).map((userId) => (
              <Profile
                key={userId}
                userId={userId}
                username={offlineUsers[userId].username}
                onClick={() => setSelectedUser(userId)}
                selected={selectedUser === userId}
                online={false}
              />
            ))}
          </div>
          <div className="my-10 p-2 text-center flex items-center justify-center absolute bottom-0 w-full">
            <span className="mr-2 text-md text-gray-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
            </svg>
              {username}
            </span>
            <button
              onClick={logout}
              className="text-md bg-blue-100 py-1 px-2 text-gray-400 border rounded-sm hover:bg-blue-200"
            >
              logout
            </button>
          </div>
        </div>
        <div className="bg-blue-200 w-2/3 p-6 flex flex-col">
          <div className="flex-grow">
            {!selectedUser && (
              <div className="h-full w-full text-gray-500 text-2xl flex justify-center items-center">
                &larr; Select a user from the sidebar
              </div>
            )}
            {!!selectedUser && (
              <div className="h-full relative">
                <div className=" overflow-y-auto absolute inset-0">
                  {filteredMsg.map((message) => (
                    <div
                      key={message._id}
                      className={
                        "" + message.sender === id ? "text-right" : "text-left"
                      }
                    >
                      <div
                        className={
                          "inline-block p-2 px-7 my-5 rounded-md text-lg " +
                          (message.sender === id
                            ? "bg-blue-500 text-gray-200"
                            : "bg-white text-gray-700")
                        }
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                  <div ref={underTheMessages}></div>
                </div>
              </div>
            )}
          </div>
          {!!selectedUser && (
            <form className="flex gap-2 h-16" onSubmit={sendMessage}>
              <input
                value={newMessageText}
                onChange={(ev) => setNewMessageText(ev.target.value)}
                type="text"
                placeholder="message"
                className="bg-white flex-grow py-2 px-5 rounded-sm text-lg"
              />
              <button type="submit" className="bg-blue-500 p-2 text-white rounded-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}  stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
            </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
