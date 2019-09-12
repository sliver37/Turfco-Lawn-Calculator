import App from './App.svelte';

let target = document.getElementById('lawn-calculator');

var app = new App({
	target: target 
});

export default app;