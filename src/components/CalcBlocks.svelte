<div class="w-full">
	<h2 class="flex"><span class="step-number">{parseInt(name)}.</span><span class="step-text">Choose your {name} shape to calculate.</span> <a class="delete-shape" href="#" on:click|preventDefault="{removeShape}">X</a></h2> 

    <ul class="selection-wrap list-unstyled">
        <li on:click|preventDefault="{() => changeSelection('square')}" class="selection-item square {control === 'square' ? 'active' : ''}">
            <div class="shape-inner">
                <span />
            </div>
        </li>
        <li on:click|preventDefault="{() => changeSelection('triangle')}" class="selection-item triangle {control === 'triangle' ? 'active' : ''}">
            <div class="shape-inner">
                <span />
            </div>
        </li>
        <li on:click|preventDefault="{() => changeSelection('circle')}" class="selection-item circle {control === 'circle' ? 'active' : ''}">
            <div class="shape-inner">
                <span />
            </div>
        </li>
        <li on:click|preventDefault="{() => changeSelection('arch')}" class="selection-item arch {control === 'arch' ? 'active' : ''}">
            <div class="shape-inner">
                <span />
            </div>
        </li>
    </ul>
    <div class="control-wrap">
        {#if control === 'square' && !localTotal  || control === 'triangle' && !localTotal}
            <div class="flex items-center simple-calc">
                <input name="width" bind:value="{width}" />
                <span class="divider">X</span>
                <input name="height" bind:value="{height}" />
                <a class="button" on:click|preventDefault="{calcSimple}" href="#">Add to Total</a>
            </div>
        {/if}
        {#if control === 'circle' && !localTotal}
            <div class="flex items-center diameter-calc">
                <input name="diameter" bind:value="{diameter}" />
                <a class="button" on:click|preventDefault="{calcDiam}" href="#">Add to Total</a>
            </div>
        {/if}
        {#if control === 'arch' && !localTotal}
            <div class="flex items-center radius-calc">
                <input name="radius" bind:value="{radius}" />
                <a class="button" on:click|preventDefault="{calcRad}" href="#">Add to Total</a>
            </div>
        {/if}
        {#if localTotal}
            <div v-if="localTotal" class="flex items-center totalBar">
                <span class="local-total">{localTotal}m<sup>2</sup></span>
                <a class="button" href="#" on:click|preventDefault="{reCalc}">Re-calculate</a>
            </div>
        {/if}
    </div>
</div>

<script>
import {onMount, createEventDispatcher} from 'svelte';
    
    const dispatch = createEventDispatcher();
    export let name;
    export let defaultShape;

    let localTotal = 0;
    let width = 0;
    let height = 0;
    let diameter = 0;
    let radius = 0;
    let pie = 3.14; //yummie
    let control = '';

    const calcSimple = () => {

        if(checkNum(width) && checkNum(height)){
            let res = parseFloat(width*height); // calculate result
            dispatch('calc', res)
            localTotal = res;
        }
        else{
            alert('Please give numeric value');
        }
    }

    const calcDiam = () => {

        if(checkNum(diameter)){
            let res = parseFloat(pie*(diameter/2))
            dispatch('calc', res)
            localTotal = res;
        }
        else{
            alert('Please give numeric value');
        }
    }

    const calcRad = () => {

        if(checkNum(radius)){
            let res = parseFloat((pie*(radius*radius))/2); // calculate result
            dispatch('calc', res)
            localTotal = res;
        }

        else{
            alert('Please give numeric value');
        }
    }

    const checkNum = (num) => {
        console.log(num)
        return num && !isNaN(num)
    }

    const reCalc = () => {
        dispatch('recalc', localTotal);
        localTotal = 0;
    }

    const removeShape = () => {
        reCalc();
        dispatch('removeshape')        
    }

    const changeSelection = (shape) => {
        if (localTotal) {
            let prompt = window.confirm('Are you sure? This will remove this shapes calculation');          
            if (prompt) {
                control = shape
                reCalc()
                width = 0;
                height = 0;
                diameter = 0;
                radius = 0;
            } 
        } else {
            control = shape    
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

.control-wrap .divider {
    font-weight: bold;
    padding: 0 10px;
}

.selection-wrap {
    display: flex;
    flex-wrap: wrap;
    margin: 20px -10px;
    justify-content: center;
}

.selection-item {
    width: 100px;
    height: 100px;
    padding: 0 10px 20px;
    position: relative;
    flex-basis: 25%;
    box-sizing: border-box;
    cursor: pointer;
}

.selection-item .shape-inner {
    height: 100%;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
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
    padding: 0 20px 0 0;
    flex-grow: 1;
    flex-basis: 50%;
    flex-shrink: 0;
}

</style>