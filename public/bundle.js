
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, changed, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(changed, child_ctx);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src\components\CalcBlock.svelte generated by Svelte v3.9.1 */
    const { console: console_1 } = globals;

    const file = "src\\components\\CalcBlock.svelte";

    // (27:8) {#if control === 'square' && !localTotal  || control === 'triangle' && !localTotal}
    function create_if_block_3(ctx) {
    	var div, input0, t0, span, t2, input1, t3, a, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			input0 = element("input");
    			t0 = space();
    			span = element("span");
    			span.textContent = "X";
    			t2 = space();
    			input1 = element("input");
    			t3 = space();
    			a = element("a");
    			a.textContent = "Add to Total";
    			attr(input0, "name", "width");
    			add_location(input0, file, 28, 16, 1472);
    			attr(span, "class", "divider svelte-rtfck8");
    			add_location(span, file, 29, 16, 1533);
    			attr(input1, "name", "height");
    			add_location(input1, file, 30, 16, 1581);
    			attr(a, "class", "button");
    			attr(a, "href", "#");
    			add_location(a, file, 31, 16, 1644);
    			attr(div, "class", "flex items-center simple-calc");
    			add_location(div, file, 27, 12, 1411);

    			dispose = [
    				listen(input0, "input", ctx.input0_input_handler),
    				listen(input1, "input", ctx.input1_input_handler),
    				listen(a, "click", prevent_default(ctx.calcSimple))
    			];
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, input0);

    			set_input_value(input0, ctx.width);

    			append(div, t0);
    			append(div, span);
    			append(div, t2);
    			append(div, input1);

    			set_input_value(input1, ctx.height);

    			append(div, t3);
    			append(div, a);
    		},

    		p: function update(changed, ctx) {
    			if (changed.width && (input0.value !== ctx.width)) set_input_value(input0, ctx.width);
    			if (changed.height && (input1.value !== ctx.height)) set_input_value(input1, ctx.height);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			run_all(dispose);
    		}
    	};
    }

    // (35:8) {#if control === 'circle' && !localTotal}
    function create_if_block_2(ctx) {
    	var div, input, t, a, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t = space();
    			a = element("a");
    			a.textContent = "Add to Total";
    			attr(input, "name", "diameter");
    			add_location(input, file, 36, 16, 1889);
    			attr(a, "class", "button");
    			attr(a, "href", "#");
    			add_location(a, file, 37, 16, 1956);
    			attr(div, "class", "flex items-center diameter-calc");
    			add_location(div, file, 35, 12, 1826);

    			dispose = [
    				listen(input, "input", ctx.input_input_handler),
    				listen(a, "click", prevent_default(ctx.calcDiam))
    			];
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, input);

    			set_input_value(input, ctx.diameter);

    			append(div, t);
    			append(div, a);
    		},

    		p: function update(changed, ctx) {
    			if (changed.diameter && (input.value !== ctx.diameter)) set_input_value(input, ctx.diameter);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			run_all(dispose);
    		}
    	};
    }

    // (41:8) {#if control === 'arch' && !localTotal}
    function create_if_block_1(ctx) {
    	var div, input, t, a, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t = space();
    			a = element("a");
    			a.textContent = "Add to Total";
    			attr(input, "name", "radius");
    			add_location(input, file, 42, 16, 2195);
    			attr(a, "class", "button");
    			attr(a, "href", "#");
    			add_location(a, file, 43, 16, 2258);
    			attr(div, "class", "flex items-center radius-calc");
    			add_location(div, file, 41, 12, 2134);

    			dispose = [
    				listen(input, "input", ctx.input_input_handler_1),
    				listen(a, "click", prevent_default(ctx.calcRad))
    			];
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, input);

    			set_input_value(input, ctx.radius);

    			append(div, t);
    			append(div, a);
    		},

    		p: function update(changed, ctx) {
    			if (changed.radius && (input.value !== ctx.radius)) set_input_value(input, ctx.radius);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			run_all(dispose);
    		}
    	};
    }

    // (47:8) {#if localTotal}
    function create_if_block(ctx) {
    	var div, span, t0, t1, sup, t3, a, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text(ctx.localTotal);
    			t1 = text("m");
    			sup = element("sup");
    			sup.textContent = "2";
    			t3 = space();
    			a = element("a");
    			a.textContent = "Re-calculate";
    			add_location(sup, file, 48, 55, 2527);
    			attr(span, "class", "local-total svelte-rtfck8");
    			add_location(span, file, 48, 16, 2488);
    			attr(a, "class", "button");
    			attr(a, "href", "#");
    			add_location(a, file, 49, 16, 2564);
    			attr(div, "v-if", "localTotal");
    			attr(div, "class", "flex items-center totalBar");
    			add_location(div, file, 47, 12, 2412);
    			dispose = listen(a, "click", prevent_default(ctx.reCalc));
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, span);
    			append(span, t0);
    			append(span, t1);
    			append(span, sup);
    			append(div, t3);
    			append(div, a);
    		},

    		p: function update(changed, ctx) {
    			if (changed.localTotal) {
    				set_data(t0, ctx.localTotal);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			dispose();
    		}
    	};
    }

    function create_fragment(ctx) {
    	var div5, h2, span0, t0, t1, span1, t2, t3, t4, t5, a, t7, ul, li0, div0, span2, li0_class_value, t8, li1, div1, span3, li1_class_value, t9, li2, div2, span4, li2_class_value, t10, li3, div3, span5, li3_class_value, t11, div4, t12, t13, t14, dispose;

    	var if_block0 = (ctx.control === 'square' && !ctx.localTotal  || ctx.control === 'triangle' && !ctx.localTotal) && create_if_block_3(ctx);

    	var if_block1 = (ctx.control === 'circle' && !ctx.localTotal) && create_if_block_2(ctx);

    	var if_block2 = (ctx.control === 'arch' && !ctx.localTotal) && create_if_block_1(ctx);

    	var if_block3 = (ctx.localTotal) && create_if_block(ctx);

    	return {
    		c: function create() {
    			div5 = element("div");
    			h2 = element("h2");
    			span0 = element("span");
    			t0 = text(ctx.stepNumber);
    			t1 = text(".");
    			span1 = element("span");
    			t2 = text("Choose your ");
    			t3 = text(ctx.name);
    			t4 = text(" shape to calculate.");
    			t5 = space();
    			a = element("a");
    			a.textContent = "X";
    			t7 = space();
    			ul = element("ul");
    			li0 = element("li");
    			div0 = element("div");
    			span2 = element("span");
    			t8 = space();
    			li1 = element("li");
    			div1 = element("div");
    			span3 = element("span");
    			t9 = space();
    			li2 = element("li");
    			div2 = element("div");
    			span4 = element("span");
    			t10 = space();
    			li3 = element("li");
    			div3 = element("div");
    			span5 = element("span");
    			t11 = space();
    			div4 = element("div");
    			if (if_block0) if_block0.c();
    			t12 = space();
    			if (if_block1) if_block1.c();
    			t13 = space();
    			if (if_block2) if_block2.c();
    			t14 = space();
    			if (if_block3) if_block3.c();
    			attr(span0, "class", "step-number svelte-rtfck8");
    			add_location(span0, file, 1, 18, 40);
    			attr(span1, "class", "step-text");
    			add_location(span1, file, 1, 64, 86);
    			attr(a, "class", "delete-shape svelte-rtfck8");
    			attr(a, "href", "#");
    			add_location(a, file, 1, 134, 156);
    			attr(h2, "class", "flex");
    			add_location(h2, file, 1, 1, 23);
    			attr(span2, "class", "svelte-rtfck8");
    			add_location(span2, file, 6, 16, 489);
    			attr(div0, "class", "shape-inner svelte-rtfck8");
    			add_location(div0, file, 5, 12, 446);
    			attr(li0, "class", li0_class_value = "selection-item square " + (ctx.control === 'square' ? 'active' : '') + " svelte-rtfck8");
    			add_location(li0, file, 4, 8, 299);
    			attr(span3, "class", "svelte-rtfck8");
    			add_location(span3, file, 11, 16, 738);
    			attr(div1, "class", "shape-inner svelte-rtfck8");
    			add_location(div1, file, 10, 12, 695);
    			attr(li1, "class", li1_class_value = "selection-item triangle " + (ctx.control === 'triangle' ? 'active' : '') + " svelte-rtfck8");
    			add_location(li1, file, 9, 8, 542);
    			attr(span4, "class", "svelte-rtfck8");
    			add_location(span4, file, 16, 16, 981);
    			attr(div2, "class", "shape-inner svelte-rtfck8");
    			add_location(div2, file, 15, 12, 938);
    			attr(li2, "class", li2_class_value = "selection-item circle " + (ctx.control === 'circle' ? 'active' : '') + " svelte-rtfck8");
    			add_location(li2, file, 14, 8, 791);
    			attr(span5, "class", "svelte-rtfck8");
    			add_location(span5, file, 21, 16, 1218);
    			attr(div3, "class", "shape-inner svelte-rtfck8");
    			add_location(div3, file, 20, 12, 1175);
    			attr(li3, "class", li3_class_value = "selection-item arch " + (ctx.control === 'arch' ? 'active' : '') + " svelte-rtfck8");
    			add_location(li3, file, 19, 8, 1034);
    			attr(ul, "class", "selection-wrap list-unstyled svelte-rtfck8");
    			add_location(ul, file, 3, 4, 248);
    			attr(div4, "class", "control-wrap svelte-rtfck8");
    			add_location(div4, file, 25, 4, 1278);
    			attr(div5, "class", "w-full");
    			add_location(div5, file, 0, 0, 0);

    			dispose = [
    				listen(a, "click", prevent_default(ctx.removeShape)),
    				listen(li0, "click", prevent_default(ctx.click_handler)),
    				listen(li1, "click", prevent_default(ctx.click_handler_1)),
    				listen(li2, "click", prevent_default(ctx.click_handler_2)),
    				listen(li3, "click", prevent_default(ctx.click_handler_3))
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div5, anchor);
    			append(div5, h2);
    			append(h2, span0);
    			append(span0, t0);
    			append(span0, t1);
    			append(h2, span1);
    			append(span1, t2);
    			append(span1, t3);
    			append(span1, t4);
    			append(h2, t5);
    			append(h2, a);
    			append(div5, t7);
    			append(div5, ul);
    			append(ul, li0);
    			append(li0, div0);
    			append(div0, span2);
    			append(ul, t8);
    			append(ul, li1);
    			append(li1, div1);
    			append(div1, span3);
    			append(ul, t9);
    			append(ul, li2);
    			append(li2, div2);
    			append(div2, span4);
    			append(ul, t10);
    			append(ul, li3);
    			append(li3, div3);
    			append(div3, span5);
    			append(div5, t11);
    			append(div5, div4);
    			if (if_block0) if_block0.m(div4, null);
    			append(div4, t12);
    			if (if_block1) if_block1.m(div4, null);
    			append(div4, t13);
    			if (if_block2) if_block2.m(div4, null);
    			append(div4, t14);
    			if (if_block3) if_block3.m(div4, null);
    		},

    		p: function update(changed, ctx) {
    			if (changed.stepNumber) {
    				set_data(t0, ctx.stepNumber);
    			}

    			if (changed.name) {
    				set_data(t3, ctx.name);
    			}

    			if ((changed.control) && li0_class_value !== (li0_class_value = "selection-item square " + (ctx.control === 'square' ? 'active' : '') + " svelte-rtfck8")) {
    				attr(li0, "class", li0_class_value);
    			}

    			if ((changed.control) && li1_class_value !== (li1_class_value = "selection-item triangle " + (ctx.control === 'triangle' ? 'active' : '') + " svelte-rtfck8")) {
    				attr(li1, "class", li1_class_value);
    			}

    			if ((changed.control) && li2_class_value !== (li2_class_value = "selection-item circle " + (ctx.control === 'circle' ? 'active' : '') + " svelte-rtfck8")) {
    				attr(li2, "class", li2_class_value);
    			}

    			if ((changed.control) && li3_class_value !== (li3_class_value = "selection-item arch " + (ctx.control === 'arch' ? 'active' : '') + " svelte-rtfck8")) {
    				attr(li3, "class", li3_class_value);
    			}

    			if (ctx.control === 'square' && !ctx.localTotal  || ctx.control === 'triangle' && !ctx.localTotal) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(div4, t12);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (ctx.control === 'circle' && !ctx.localTotal) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					if_block1.m(div4, t13);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (ctx.control === 'arch' && !ctx.localTotal) {
    				if (if_block2) {
    					if_block2.p(changed, ctx);
    				} else {
    					if_block2 = create_if_block_1(ctx);
    					if_block2.c();
    					if_block2.m(div4, t14);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (ctx.localTotal) {
    				if (if_block3) {
    					if_block3.p(changed, ctx);
    				} else {
    					if_block3 = create_if_block(ctx);
    					if_block3.c();
    					if_block3.m(div4, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div5);
    			}

    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			run_all(dispose);
    		}
    	};
    }

    let pie = 3.14;

    function instance($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
        let { name, defaultShape } = $$props;

        let localTotal = 0;
        let width = 0;
        let height = 0;
        let diameter = 0;
        let radius = 0; //yummie
        let control = '';

        const calcSimple = () => {

            if(checkNum(width) && checkNum(height)){
                let res = parseFloat(width*height); // calculate result
                dispatch('calc', res);
                $$invalidate('localTotal', localTotal = res);
            }
            else{
                alert('Please give numeric value');
            }
        };

        const calcDiam = () => {

            if(checkNum(diameter)){
                let res = parseFloat(pie*(diameter/2));
                dispatch('calc', res);
                $$invalidate('localTotal', localTotal = res);
            }
            else{
                alert('Please give numeric value');
            }
        };

        const calcRad = () => {

            if(checkNum(radius)){
                let res = parseFloat((pie*(radius*radius))/2); // calculate result
                dispatch('calc', res);
                $$invalidate('localTotal', localTotal = res);
            }

            else{
                alert('Please give numeric value');
            }
        };

        const checkNum = (num) => {
            console.log(num);
            return num && !isNaN(num)
        };

        const reCalc = () => {
            dispatch('recalc', localTotal);
            $$invalidate('localTotal', localTotal = 0);
        };

        const removeShape = () => {
            let prompt = window.confirm(`Are you sure you want to remove shape ${stepNumber}?`);          
            
            if (prompt) {
                reCalc();
                dispatch('removeshape');    
            }    
        };

        const changeSelection = (shape) => {
            if (localTotal) {
                let prompt = window.confirm('Are you sure? This will remove this shapes calculation');          
                if (prompt) {
                    $$invalidate('control', control = shape);
                    reCalc();
                    $$invalidate('width', width = 0);
                    $$invalidate('height', height = 0);
                    $$invalidate('diameter', diameter = 0);
                    $$invalidate('radius', radius = 0);
                } 
            } else {
                $$invalidate('control', control = shape);    
            }  
                        
        }; 

        onMount(() => {
            if (name) {
                $$invalidate('control', control = defaultShape);
            }
        });

    	const writable_props = ['name', 'defaultShape'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console_1.warn(`<CalcBlock> was created with unknown prop '${key}'`);
    	});

    	function click_handler() {
    		return changeSelection('square');
    	}

    	function click_handler_1() {
    		return changeSelection('triangle');
    	}

    	function click_handler_2() {
    		return changeSelection('circle');
    	}

    	function click_handler_3() {
    		return changeSelection('arch');
    	}

    	function input0_input_handler() {
    		width = this.value;
    		$$invalidate('width', width);
    	}

    	function input1_input_handler() {
    		height = this.value;
    		$$invalidate('height', height);
    	}

    	function input_input_handler() {
    		diameter = this.value;
    		$$invalidate('diameter', diameter);
    	}

    	function input_input_handler_1() {
    		radius = this.value;
    		$$invalidate('radius', radius);
    	}

    	$$self.$set = $$props => {
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    		if ('defaultShape' in $$props) $$invalidate('defaultShape', defaultShape = $$props.defaultShape);
    	};

    	let stepNumber;

    	$$self.$$.update = ($$dirty = { name: 1 }) => {
    		if ($$dirty.name) { $$invalidate('stepNumber', stepNumber = parseInt(name)); }
    	};

    	return {
    		name,
    		defaultShape,
    		localTotal,
    		width,
    		height,
    		diameter,
    		radius,
    		control,
    		calcSimple,
    		calcDiam,
    		calcRad,
    		reCalc,
    		removeShape,
    		changeSelection,
    		stepNumber,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		input0_input_handler,
    		input1_input_handler,
    		input_input_handler,
    		input_input_handler_1
    	};
    }

    class CalcBlock extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["name", "defaultShape"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.name === undefined && !('name' in props)) {
    			console_1.warn("<CalcBlock> was created without expected prop 'name'");
    		}
    		if (ctx.defaultShape === undefined && !('defaultShape' in props)) {
    			console_1.warn("<CalcBlock> was created without expected prop 'defaultShape'");
    		}
    	}

    	get name() {
    		throw new Error("<CalcBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<CalcBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get defaultShape() {
    		throw new Error("<CalcBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set defaultShape(value) {
    		throw new Error("<CalcBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.9.1 */

    const file$1 = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.calcblock = list[i];
    	child_ctx.index = i;
    	return child_ctx;
    }

    // (3:2) {#each calcblocks as calcblock, index (calcblock.id)}
    function create_each_block(key_1, ctx) {
    	var div, current;

    	function removeshape_handler() {
    		return ctx.removeshape_handler(ctx);
    	}

    	var calcblock = new CalcBlock({
    		props: {
    		name: ctx.suffixNum(ctx.index+1),
    		defaultShape: ctx.calcblock.default
    	},
    		$$inline: true
    	});
    	calcblock.$on("calc", ctx.calc);
    	calcblock.$on("recalc", ctx.reCalc);
    	calcblock.$on("removeshape", removeshape_handler);

    	return {
    		key: key_1,

    		first: null,

    		c: function create() {
    			div = element("div");
    			calcblock.$$.fragment.c();
    			attr(div, "class", "block-wrap svelte-1x4nxem");
    			add_location(div, file$1, 3, 3, 108);
    			this.first = div;
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(calcblock, div, null);
    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			var calcblock_changes = {};
    			if (changed.suffixNum || changed.calcblocks) calcblock_changes.name = ctx.suffixNum(ctx.index+1);
    			if (changed.calcblocks) calcblock_changes.defaultShape = ctx.calcblock.default;
    			calcblock.$set(calcblock_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(calcblock.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(calcblock.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(calcblock);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var div3, div2, each_blocks = [], each_1_lookup = new Map(), t0, a0, t2, div1, div0, span0, t4, input, t5, span1, t6, sup, t8, a1, current, dispose;

    	var each_value = ctx.calcblocks;

    	const get_key = ctx => ctx.calcblock.id;

    	for (var i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	return {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();

    			t0 = space();
    			a0 = element("a");
    			a0.textContent = "Add Shape";
    			t2 = space();
    			div1 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "=";
    			t4 = space();
    			input = element("input");
    			t5 = space();
    			span1 = element("span");
    			t6 = text("m");
    			sup = element("sup");
    			sup.textContent = "2";
    			t8 = space();
    			a1 = element("a");
    			a1.textContent = "Buy Turf Online";
    			attr(a0, "class", "button button__add-shape");
    			attr(a0, "href", "#");
    			add_location(a0, file$1, 8, 2, 324);
    			attr(span0, "class", "total__equals svelte-1x4nxem");
    			add_location(span0, file$1, 13, 4, 520);
    			input.disabled = true;
    			attr(input, "class", "total__value svelte-1x4nxem");
    			add_location(input, file$1, 14, 4, 562);
    			add_location(sup, file$1, 15, 33, 657);
    			attr(span1, "class", "total__metric");
    			add_location(span1, file$1, 15, 4, 628);
    			attr(div0, "class", "flex items-center total svelte-1x4nxem");
    			add_location(div0, file$1, 12, 3, 477);
    			attr(a1, "class", "et_pb_button button");
    			attr(a1, "href", "#");
    			add_location(a1, file$1, 17, 3, 692);
    			attr(div1, "class", "flex items-center total-wrapper svelte-1x4nxem");
    			add_location(div1, file$1, 11, 2, 427);
    			attr(div2, "class", "calculator-wrap svelte-1x4nxem");
    			add_location(div2, file$1, 1, 1, 17);
    			attr(div3, "id", "app");
    			add_location(div3, file$1, 0, 0, 0);

    			dispose = [
    				listen(a0, "click", prevent_default(ctx.addShape)),
    				listen(input, "input", ctx.input_input_handler)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div2);

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(div2, null);

    			append(div2, t0);
    			append(div2, a0);
    			append(div2, t2);
    			append(div2, div1);
    			append(div1, div0);
    			append(div0, span0);
    			append(div0, t4);
    			append(div0, input);

    			set_input_value(input, ctx.total);

    			append(div0, t5);
    			append(div0, span1);
    			append(span1, t6);
    			append(span1, sup);
    			append(div1, t8);
    			append(div1, a1);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			const each_value = ctx.calcblocks;

    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, div2, outro_and_destroy_block, create_each_block, t0, get_each_context);
    			check_outros();

    			if (changed.total && (input.value !== ctx.total)) set_input_value(input, ctx.total);
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			for (i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div3);
    			}

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();

    			run_all(dispose);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let total = 0;
    	
    	const addShape = () => {
    		let newBlock = {
    			id: generateUID()
    		};
    		console.log(newBlock);
    		$$invalidate('calcblocks', calcblocks = [...calcblocks, newBlock]);
    	};
    	
        const removeShape = (index) => {
    		console.log(index);
          	$$invalidate('calcblocks', calcblocks = calcblocks.filter((calcblock, i) => i !== index));
    	};
    	
        const calc = (e) => {
    		console.log('test');
          $$invalidate('total', total += e.detail);
    	};
    	
        const reCalc = (e) => {
          $$invalidate('total', total -= e.detail);
    	};
    	
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
    	};

    	const generateUID = () => {
    		return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    			(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    		)
    	};

    	function removeshape_handler({ index }) {
    		return removeShape(index);
    	}

    	function input_input_handler() {
    		total = this.value;
    		$$invalidate('total', total);
    	}

    	let calcblocks;

    	$$invalidate('calcblocks', calcblocks = [
    					{ id: generateUID(), default: 'square' },
    					{ id: generateUID(), default: 'triangle' },
    					{ id: generateUID(), default: 'circle' },
    					{ id: generateUID(), default: 'arch' }
    				]);

    	return {
    		total,
    		addShape,
    		removeShape,
    		calc,
    		reCalc,
    		suffixNum,
    		calcblocks,
    		removeshape_handler,
    		input_input_handler
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
