import React from 'react';
import { MessagesList } from '../';
import './Chat.css';

const Chat = (props) => {
	return (
		<div className='chat'>
			<MessagesList room={props.room} messages={props.messages} />
			<input
				name='message'
				value={props.message}
				className='chat__input-message'
				placeholder='Type here...'
				onChange={props.handleOnChange}
				onKeyDown={props.handleSendMessage}
			/>
		</div>
	);
}

export default Chat;
