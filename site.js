const getData = () => {
  document.dispatchEvent(new Event(EventGetData));
};
document.body.onload = getData;
document.addEventListener("DOMContentLoaded", function () {
  document.dispatchEvent(EventGetData);

  document.getElementById("inputUser").addEventListener("submit", function (e) {
    e.preventDefault();
    addUser();
  });

  document.getElementById("searchUsername").addEventListener("input", (e) => {
    e.preventDefault();
    document.dispatchEvent(EventGetData);
  });
});

let ArrUsers = [];
const EventSetLocalStorage = new Event("EventSetLocalStorage");
const EventGetData = new Event("EventGetData");

addUser = () => {
  let inputUsername = getValue("inputUsername");
  let inputFullname = getValue("inputFullname");
  let inputRole = Number(getValue("inputRole"));
  let isActive = getValue("isActive");
  const UserData = {
    id: +new Date(),
    username: inputUsername,
    fullname: inputFullname,
    role: inputRole,
    isComplete: isActive === undefined ? false : true,
  };

  ArrUsers = ArrUsers === null ? [] : ArrUsers;

  ArrUsers.push(UserData);
  document.dispatchEvent(EventSetLocalStorage);
  document.dispatchEvent(EventGetData);
};

document.addEventListener("EventSetLocalStorage", function () {
  localStorage.setItem("ArrUsers", JSON.stringify(ArrUsers));
});

document.addEventListener("EventGetData", function () {
  ArrUsers = JSON.parse(localStorage.getItem("ArrUsers"));

  if (ArrUsers === null || ArrUsers === undefined) {
    return;
  }
  const e = getValue("searchUsername").toUpperCase();
  ArrUsers = ArrUsers.filter((t) => t.username.toUpperCase().includes(e));
  ArrUsers = void 0 === ArrUsers ? [] : ArrUsers;
  document.getElementById("table-body-belum").innerHTML = "";
  document.getElementById("table-body-sudah").innerHTML = "";
  ArrUsers.forEach((e) => {
    addTableRow(
      e.isComplete === true ? "table-body-sudah" : "table-body-belum",
      e
    );
  });
});
const getValue = (id) => {
  return document.querySelector("#" + id).type !== "checkbox"
    ? document.getElementById(id).value
    : document.querySelector("#" + id + ":checked")?.value;
};
const removeUser = (id) => {
  const confirm = window.confirm("Anda Yakin ?");

  if (!confirm) {
    return;
  }
  let UserId = findUserIndex(id);
  ArrUsers.splice(UserId, 1);
  document.dispatchEvent(EventSetLocalStorage);
  document.dispatchEvent(EventGetData);
};
function undoInCompleteUserCompleted(id) {
  const User = findUser(id);
  if (User == null) return;
  User.isComplete = !User.isComplete;
  document.dispatchEvent(EventSetLocalStorage);
  document.dispatchEvent(EventGetData);
}
const findUserIndex = (id) => {
  ArrUsers = JSON.parse(localStorage.getItem("ArrUsers"));
  ArrUsers = null === ArrUsers ? [] : ArrUsers;
  return ArrUsers.findIndex((item) => item.id === id);
};

const findUser = (id) => {
  ArrUsers = JSON.parse(localStorage.getItem("ArrUsers"));
  ArrUsers = null === ArrUsers ? [] : ArrUsers;
  return ArrUsers.find((item) => item.id === id);
};

function addTableRow(parentId, data) {
  const parentElement = document.getElementById(parentId);
  const elementTR = document.createElement("tr");

  elementTR.setAttribute("class", "hover:bg-gray-100");
  const elementUsername = document.createElement("td");
  elementUsername.textContent = data.username;
  elementUsername.setAttribute("class", "px-6 py-4 whitespace-no-wrap");
  const elementUser = document.createElement("td");
  elementUser.textContent = data.fullname;
  elementUser.setAttribute("class", "px-6 py-4 whitespace-no-wrap");
  const elementrole = document.createElement("td");
  elementrole.setAttribute("class", "px-6 py-4 whitespace-no-wrap");
  elementrole.textContent = data.role;
  const containerAction = document.createElement("td");
  const btnIsActive = document.createElement("button");
  btnIsActive.textContent = (data.isComplete ? "Inactive " : "") + "Active";
  btnIsActive.classList.add(
    "bg-blue-500",
    "hover:bg-blue-700",
    "text-white",
    "py-2",
    "px-4",
    "rounded",
    "mr-2"
  );
  btnIsActive.addEventListener("click", () => {
    undoInCompleteUserCompleted(data.id);
  });
  const buttonDelete = document.createElement("button");
  buttonDelete.textContent = "Delete";

  buttonDelete.classList.add(
    "bg-red-500",
    "hover:bg-red-700",
    "text-white",
    "font-bold",
    "py-2",
    "px-4",
    "rounded"
  );

  buttonDelete.addEventListener("click", () => {
    removeUser(data.id);
  });

  containerAction.appendChild(btnIsActive);
  containerAction.appendChild(buttonDelete);
  elementTR.appendChild(elementUsername);
  elementTR.appendChild(elementUser);
  elementTR.appendChild(elementrole);
  elementTR.appendChild(containerAction);
  parentElement.appendChild(elementTR);
}
