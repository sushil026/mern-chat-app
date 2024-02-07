import React, { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";

function RegisterAndLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { setUsername: setLoggedinUser, setId } = useContext(UserContext);
  const [isLoggedIn, setIsLoggedIn] = useState("register");

  async function handleSubmit(event) {
    event.preventDefault();
    const url = isLoggedIn === "register" ? "register" : "login";
    const { data } = await axios.post(url, { username, password });
    setLoggedinUser(username);
    setId(data.id);
  }

  return (
    <div className="animate-background bg-gradient-to-tr from-[rgb(111,94,187)] via-[#4c6674] to-[#055885] h-screen flex items-center text-[#c9c9c9]">
      <form
        className="w-96 h-48 mx-auto grid justify-items-center px-5 py-2 box-content backdrop-filter bg-transparent text-xl"
        onSubmit={handleSubmit}
      >
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          placeholder="Username"
          className= "block w-full mb-2 rounded-sm px-2 py-1 border-cerulean border-solid border-2 text-black"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="block w-full mb-2 rounded-sm px-2 py-1 border-cerulean border-solid border-2 text-black"
        />
        <button className=" mb-2 bg-lapisLazuli text-white rounded-lg px-6 w-full hover:bg-celestialBlue py-1">
          {isLoggedIn === "register" ? "Register" : "Login"}
        </button>
        {isLoggedIn === "register" && (
          <div className="text-lg">
            Already a user?{" "}
            <button
              onClick={() => setIsLoggedIn("login")}
              className="underline decoration-prussianBlue hover:decoration-[#93c5fd]"
            >
              Login here!
            </button>
          </div>
        )}
        {isLoggedIn === "login" && (
          <div className="text-lg">
            Don't have an account?{" "}
            <button
              onClick={() => setIsLoggedIn("register")}
              className="underline decoration-prussianBlue hover:decoration-[#93c5fd]"
            >
              Register here!
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default RegisterAndLoginForm;
