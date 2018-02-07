import React from 'react';
import './Square.css';

export default function Square(props) {
	if (props.value === 'X') {
		return (
			<div class="cell">
				<div class="cross hidden"></div>
			</div>
		);
	}
	if (props.value === 'O') {
		return (
			<div class="cell">
				<div class="circle hidden"></div>
			</div>
		);
	}
	return (
		<button className="cell" onClick={props.onClick}>
			{props.value}
		</button>
	)
};
