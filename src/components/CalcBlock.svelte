<div class="w-full">
	<h2 class="flex items-center"><span class="step-number">{stepNumber}.</span><span class="step-text">Choose your {name} shape to calculate.</span> {#if totalShapeCount > 1}<a class="delete-shape" href="#" on:click|preventDefault="{removeShape}">X</a>{/if}</h2> 

    <ul class="selection-wrap list-unstyled">
        {#each shapes as shape (shape.name)}
            <li on:click|preventDefault="{() => changeSelection(shape)}" class="selection-item {shape.name} {control === shape.name ? 'active' : ''}">
                <div class="shape-inner">
                    <span />
                </div>
            </li>
	    {/each}
    </ul>

    <div class="control-wrap">

        {#each shapes as shape (blockid + shape.name)}
            {#if shape.name === control && !localTotal}
                <svelte:component shape="{shape.name}" this={shape.controls} on:calc={controlCalc} />
            {/if}
	    {/each}

        {#if localTotal}
            <div v-if="localTotal" class="flex items-center totalBar">
                <span class="local-total total__value-box">{localTotal}m<sup>2</sup></span>
                <a class="button" href="#" on:click|preventDefault="{reCalc}">Re-calculate</a>
            </div>
        {/if}
    </div>
</div>

<script>
import {onMount, createEventDispatcher} from 'svelte'
import Simple from './calc-controls/Simple.svelte'
import Diameter from './calc-controls/Diameter.svelte'
import Radius from './calc-controls/Radius.svelte'
    
    const dispatch = createEventDispatcher()

    // Props
    export let blockid
    export let name
    export let defaultShape
    export let totalShapeCount

    // Reactive Computed
    $: stepNumber = parseInt(name)

    // Define your shapes and which controls will be used for calculation
    let shapes = [
        {
            name: 'square',
            controls: Simple
        },
        {
            name: 'triangle',
            controls: Simple
        },
        {
            name: 'circle',
            controls: Diameter
        },
        {
            name: 'arch',
            controls: Radius
        },
    ]

    // This is the total of this particular block
    let localTotal = 0
    const controlCalc = (res) => {
        localTotal = res.detail;
        return dispatch('calc', localTotal)
    }
    const reCalc = () => {
        dispatch('recalc', localTotal)
        localTotal = 0
    }
    const removeShape = () => {
        let prompt = window.confirm(`Are you sure you want to remove shape ${stepNumber}?`)         
        
        if (prompt) {
            reCalc()
            dispatch('removeshape')    
        }    
    }

    let control = ''
    const changeSelection = (shape) => {
        if (localTotal) {
            let prompt = window.confirm('Are you sure? This will remove this shapes calculation')        
            if (prompt) {
                control = shape.name
                reCalc()
                width = null
                height = null
                diameter = null
                radius = null
            } 
        } else {
            control = shape.name   
        }              
    } 
    onMount(() => {
        if (name) {
            control = defaultShape
        }
    })

</script>


<style>

.step-number {
    color: #12994d;
    padding-right: 20px;
}

.step-text {
    font-size: 2.4rem;
    line-height: 1;
} 

.delete-shape {
    background: #545454;
    color: white;
    padding: 2px 8px;
    max-height: 20px;
    border-radius: 5px;
    font-size: 12px;
    margin-left: auto;
    display: flex;
    align-items: center;
    opacity: 0.5;
    text-decoration: none;
    transition: opacity 0.2s;
}

.delete-shape:hover {
    opacity: 1;
}

.selection-wrap {
    display: flex;
    flex-wrap: wrap;
    margin: 20px -10px 0;
    padding: 0;
    justify-content: center;
}

.selection-item {
    display: block !important;
    width: 100px;
    padding: 0 10px 20px;
    position: relative;
    flex-basis: 50%;
    box-sizing: border-box;
    cursor: pointer;
    margin-bottom: 0;
}

.selection-item:before {
    display: none !important;
}

.selection-item .shape-inner {
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
}

.selection-item .shape-inner:after {
    content: '';
    padding-bottom: 100%;    
}

.selection-item:not(.triangle) span {
    background: #12994d;
}

.selection-item.active .shape-inner {
    background: #12994d;
}

.selection-item.active:not(.triangle) span{
    background: black;
}

.square span {
    width: 60px;
    height: 40px;
}

.triangle span {
    width: 0;
    height: 0;
    border-bottom: 40px solid #12994d;
    border-right: 60px solid transparent;
}

.triangle.active span {
    border-bottom-color: black;
}

.circle span {
    width: 50px;
    height: 50px;
    border-radius: 50%;
}

.arch span {
    width: 50px;
    height: 25px;
    border-top-left-radius: 110px;
    border-top-right-radius: 110px;
}

.local-total {
    flex-grow: 1;
    flex-basis: 50%;
    flex-shrink: 0;
}

.control-wrap > div {
    flex-direction: column;
}

.control-wrap .button {
    margin-top: 2rem;
}


@media all and (min-width: 768px) {
    .control-wrap > div {
        flex-direction: row;
    }   
        
    .control-wrap .button {
        margin-top: 0;
    }

    
    .selection-item {
        flex-basis: 25%;
    }
}

</style>