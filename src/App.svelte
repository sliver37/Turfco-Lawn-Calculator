<div id="app-calculator">
	<div class="calculator-wrap">
		{#each calcblocks as calcblock, index (calcblock.id)}
			<div class="block-wrap">
				<CalcBlock blockid="{calcblock.id}" on:calc="{calc}" on:recalc="{reCalc}" on:removeshape="{() => removeShape(index)}" name="{suffixNum(index+1)}" totalShapeCount="{calcblocks.length}" defaultShape="{calcblock.default}" />
			</div>
		{/each}

		<a class="button button__add-shape" href="#" on:click|preventDefault="{addShape}">Add another shape <i class="text-black fas fa-plus"></i></a>
	</div>
	<div class="flex items-center total-wrapper">
			<div class="flex items-center total">
				<span class="total__equals">=</span>
				<div class="flex items-center total__value-box total__value-box--main flex-grow-1">
					<span class="total__text flex-grow-1">Total</span>
					<span class="total__value">{total}</span>
				</div>				
				<span class="total__metric">m<sup>2</sup></span>
			</div>
			<a class="et_pb_button" href="{dataUrl}">Buy Turf Online</a>
		</div>    
</div>

<script>
import CalcBlock from './components/CalcBlock.svelte'
import { generateUID } from './components/functions/genID'
import { suffixNum } from './components/functions/numberSuffix'

	let total = 0;

	let dataUrl = document.getElementById('lawn-calculator').getAttribute('data-url');

	$: calcblocks = [
		{ id: generateUID(), default: 'square' },
	]
	
	const addShape = () => {
		let newBlock = {
			id: generateUID(),
			default: 'square'
		}
		calcblocks = [...calcblocks, newBlock]
	}
	
    const removeShape = (index) => {
      	calcblocks = calcblocks.filter((calcblock, i) => i !== index);
	}
	
    const calc = (e) => {
		let result = parseFloat(e.detail);
      	total += result
	}
	
    const reCalc = (e) => {
		let result = parseFloat(e.detail);
      	total -= result
	}
	
</script>

<style>


.total-wrapper {
	padding: 2rem 0;
    flex-direction: column;
}

.total__value-box--main {
	background: #e9e9e9;
	max-width: 260px;
}

.total {
	font-size: 20px;
	flex-grow: 1;
	padding-right: 2rem;
	width: 100%;
	margin-bottom: 2rem;
}

.total__equals {
	font-weight: bold;
	font-size: 24px; 
	margin-right: 10px;
}

.total__value {
	margin-right: 10px;
}

.total__text {
	text-align: left;
	font-size: 16px;
	font-weight: bold;
}

#app-calculator {
	max-width: 800px;
	margin: 0 auto;  
}

.calculator-wrap {
	background: #e9e9e9;
}

.block-wrap {
	padding: 2rem;
	align-items: center;
	display: flex;
	flex-direction: column;
}

.block-wrap:last-of-type {
	margin-bottom: 0;
}

@media all and (min-width: 768px) {	
	.total {
		width: auto;
		margin-bottom: 0;
	}

	.total-wrapper {
		flex-direction: row;
	}
}

</style>