<div id="app">
	<div class="calculator-wrap">
		{#each calcblocks as calcblock, index (calcblock.id)}
			<div class="block-wrap">
				<CalcBlock on:calc="{calc}" on:recalc="{reCalc}" on:removeshape="{() => removeShape(index)}" name="{suffixNum(index+1)}" defaultShape="{calcblock.default}" />
			</div>
		{/each}

		<a class="button button__add-shape" href="#" on:click|preventDefault="{addShape}">Add Shape</a>


		<div class="flex items-center total-wrapper">
			<div class="flex items-center total">
				<span class="total__equals">=</span>
				<input disabled class="total__value" bind:value="{total}" />
				<span class="total__metric">m<sup>2</sup></span>
			</div>
			<a class="et_pb_button button" href="#">Buy Turf Online</a>
		</div>	

	</div>    
</div>

<script>
import CalcBlock from './components/CalcBlock.svelte'

	let total = 0;

	$: calcblocks = [
			{ id: generateUID(), default: 'square' },
			{ id: generateUID(), default: 'triangle' },
			{ id: generateUID(), default: 'circle' },
			{ id: generateUID(), default: 'arch' }
		]
	
	const addShape = () => {
		let newBlock = {
			id: generateUID()
		}
		console.log(newBlock)
		calcblocks = [...calcblocks, newBlock]
	}
	
    const removeShape = (index) => {
		console.log(index)
      	calcblocks = calcblocks.filter((calcblock, i) => i !== index);
	}
	
    const calc = (e) => {
		console.log('test')
      total += e.detail
	}
	
    const reCalc = (e) => {
      total -= e.detail
	}
	
	const suffixNum = (i) => {
		var j = i % 10,
			k = i % 100;
		if (j == 1 && k != 11) {
			return i + "st";
		}
		if (j == 2 && k != 12) {
			return i + "nd";
		}
		if (j == 3 && k != 13) {
			return i + "rd";
		}
		return i + "th";
	}

	const generateUID = () => {
		return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
			(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
		)
	}

</script>

<style>
.total {
	font-size: 20px;
	flex-grow: 1;
}

.total__equals {
	font-weight: bold;
	font-size: 24px; 
	margin-right: 10px;
}

.total__value {
	margin-right: 10px;
}

.calculator-wrap {
	padding: 20px;
	background: #e9e9e9;
	max-width: 620px;
	margin: 0 auto;  
}

.block-wrap {
	margin-bottom: 30px;
	align-items: center;
	display: flex;
	flex-direction: column;
}

.block-wrap:last-of-type {
	margin-bottom: 0;
}

  </style>