export default function Avatar({ username, userId , online}) {
  const colors = [
    "bg-teal-200","bg-red-200","bg-green-200","bg-purple-200","bg-blue-200",
    "bg-yellow-200","bg-orange-200","bg-pink-200","bg-fuchsia-200","bg-rose-200",
  ];
  const uIDbase10 = parseInt( userId, 16)
  const colorIndex = uIDbase10 % colors.length;
  const color = colors[colorIndex]

  return (
    <div className={"h-16 w-16 rounded-full flex items-center border border-white relative "+ color}>
      <div className="text-center w-full opacity-60">{username[0]}</div>
      {
        online ?  <div className="h-5 w-5 bg-[#4ade80] rounded-full border border-white absolute bottom-1 right-0"></div>:
        <div className="h-5 w-5 bg-[#878787] rounded-full border border-white absolute bottom-1 right-0"></div>

      }
    </div>
  );
}
