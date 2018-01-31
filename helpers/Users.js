class Users {
	constructor() {
		this.users = [];
	}

	addUserData(id, room) {
		const user = {id, room};
		this.users.push(user);
		return user;
	}

	removeUser(id) {
		const user = this.getUser(id);
		if(user) {
			this.users = this.users.filter((user) => user.id !== id);
		}
		return user;
	}

	getUser(id) {
		const getUser = this.users.filter((user) => user.id === id)[0];
		return getUser;
	}

	getUsersList(room) {
		const users = this.users.filter((user) => user.room === room);
		const namesArray = users.map((user) => user.login);
		return namesArray;
	}
	
	addLogin(id, login) {
		const user = this.getUser(id);
		user.login = login;
		return this.users;
	}
}

module.exports = {Users}