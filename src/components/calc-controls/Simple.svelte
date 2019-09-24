<div class="flex items-center simple-calc">
    <input name="width" placeholder="Width" bind:value="{width}" />
    <span class="divider"><i class="fas fa-times"></i></span>
    <input name="height" placeholder="Height" bind:value="{height}" />
    <a class="button" on:click|preventDefault="{calcSimple}" href="#">Add to Total</a>
</div>

<script>
import {createEventDispatcher} from 'svelte'
import { checkNum } from '../functions/checkNumber'
    
    const dispatch = createEventDispatcher()

    export let shape

    let width = null
    let height = null

    const calcSimple = () => {

        if(checkNum(width) && checkNum(height)){
            console.log(shape)
            let res = (width*height) // calculate result
            res = shape === 'triangle' ? res/2 : res
            res = res.toFixed(1)

            dispatch('calc', res)
        }
        else{
            alert('Please give numeric value')
        }
    }

</script>

<style>
.simple-calc .divider {
    font-weight: bold;
    padding: 0 10px;
}
</style>