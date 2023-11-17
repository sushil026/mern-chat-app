import Avatar from "./Avatar";

export default function Profile( {userId, username, onClick, selected, online}) {
  return (
    <div key={userId} className={ "border-b-2 text-xl flex h-24 cursor-pointer " + (selected ? "bg-blue-200" : "")}
      onClick={() => onClick(userId)}>
      {selected && (
        <div className="w-2 rounded-r h-full bg-blue-500"></div>
      )}
      <div className="flex items-center gap-5 px-10">
        <Avatar username={username} userId={userId} online={online} />
        {username}
      </div>
    </div>
  );
}
