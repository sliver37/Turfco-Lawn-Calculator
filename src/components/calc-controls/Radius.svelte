<div class="flex items-center radius-calc">
    <input name="radius" placeholder="Radius" bind:value="{radius}" />
    <a class="button" on:click|preventDefault="{calcRad}" href="#">Add to Total</a>
</div>

<script>
import {createEventDispatcher} from 'svelte'
import { checkNum } from '../functions/checkNumber'
    
    const dispatch = createEventDispatcher()

    export let shape

    let radius = null

    const calcRad = () => {
        if(checkNum(radius)){
            let res = ((Math.PI * (radius*radius))/2).toFixed(1)
            dispatch('calc', res)
        } else{
            alert('Please give numeric value')
        }
    }

</script>