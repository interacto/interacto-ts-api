/*
 * This file is part of Interacto.
 * Interacto is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Interacto is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with Interacto.  If not, see <https://www.gnu.org/licenses/>.
 */
import type {Binding, FSM, Interaction, InteractionBase, InteractionData} from "../../src/interacto";
import {BindingsImpl} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";
import {createTouchEvent} from "../interaction/StubEvents";
import {BindingsContext} from "../../src/impl/binding/BindingsContext";
import type {Flushable} from "../../src/impl/interaction/Flushable";
import type {Bindings} from "../../src/api/binding/Bindings";

let binding: Binding<StubCmd, Interaction<InteractionData>, InteractionData> | undefined;
let cmd: StubCmd;
let ctx: BindingsContext;
let bindings: Bindings;

beforeEach(() => {
    bindings = new BindingsImpl();
    ctx = new BindingsContext();
    bindings.setBindingObserver(ctx);
    jest.useFakeTimers();
    cmd = new StubCmd(true);
});

afterEach(() => {
    jest.clearAllTimers();
    bindings.clear();
});

describe("on canvas", () => {
    let c1: HTMLElement;

    beforeEach(() => {
        c1 = document.createElement("canvas");
    });

    test("run tap produces cmd", () => {
        binding = bindings.tapBinder(2)
            .toProduce(() => cmd)
            .on(c1)
            .bind();

        c1.dispatchEvent(createTouchEvent("touchend", 1, c1, 11, 23, 110, 230));
        c1.dispatchEvent(createTouchEvent("touchend", 1, c1, 11, 23, 110, 230));
        c1.dispatchEvent(createTouchEvent("touchend", 2, c1, 31, 13, 310, 130));
        c1.dispatchEvent(createTouchEvent("touchend", 2, c1, 31, 13, 310, 130));

        expect(binding).toBeDefined();
        expect(cmd.exec).toStrictEqual(1);
        expect(ctx.commands).toHaveLength(1);
        expect(ctx.getCmd(0)).toBe(cmd);
    });


    test("run tap two times recycle events", () => {
        binding = bindings.tapBinder(2)
            .toProduce(() => new StubCmd(true))
            .on(c1)
            .bind();

        c1.dispatchEvent(createTouchEvent("touchstart", 1, c1, 11, 23, 110, 230));
        c1.dispatchEvent(createTouchEvent("touchend", 1, c1, 11, 23, 110, 230));
        c1.dispatchEvent(createTouchEvent("touchstart", 2, c1, 31, 13, 310, 130));
        c1.dispatchEvent(createTouchEvent("touchend", 2, c1, 31, 13, 310, 130));
        c1.dispatchEvent(createTouchEvent("touchstart", 2, c1, 31, 13, 310, 130));
        c1.dispatchEvent(createTouchEvent("touchend", 2, c1, 31, 13, 310, 130));
        c1.dispatchEvent(createTouchEvent("touchstart", 2, c1, 31, 13, 310, 130));
        c1.dispatchEvent(createTouchEvent("touchend", 2, c1, 31, 13, 310, 130));

        expect(binding).toBeDefined();
        expect(ctx.commands).toHaveLength(2);
    });

    test("unsubscribe does not trigger the binding", () => {
        binding = bindings.tapBinder(2)
            .toProduce(() => cmd)
            .on(c1)
            .bind();

        (binding.interaction as InteractionBase<InteractionData, Flushable & InteractionData, FSM>).onNodeUnregistered(c1);

        c1.dispatchEvent(createTouchEvent("touchend", 1, c1, 11, 23, 110, 230));

        expect(binding.running).toBeFalsy();
    });
});

describe("on svg doc for dynamic registration", () => {
    let doc: HTMLElement;

    beforeEach(() => {
        doc = document.createElement("svg");
    });

    test("dynamic registration with nothing added", () => {
        binding = bindings.tapBinder(2)
            .toProduce(() => cmd)
            .onDynamic(doc)
            .bind();

        doc.dispatchEvent(createTouchEvent("touchend", 1, doc, 11, 23, 110, 230));

        expect(binding.running).toBeFalsy();
        expect(binding).toBeDefined();
        expect(ctx.commands).toHaveLength(0);
    });

    test("dynamic registration with a node added", async () => {
        binding = bindings.tapBinder(2)
            .toProduce(() => cmd)
            .onDynamic(doc)
            .bind();

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        doc.appendChild(rect);

        // Waiting for the mutation changes to be done.
        await Promise.resolve();

        rect.dispatchEvent(createTouchEvent("touchend", 1, rect, 11, 23, 110, 230));
        rect.dispatchEvent(createTouchEvent("touchend", 1, rect, 11, 23, 110, 230));

        expect(binding).toBeDefined();
        expect(ctx.commands).toHaveLength(1);
    });

    test("dynamic registration with a node already added", async () => {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        doc.appendChild(rect);

        // Waiting for the mutation changes to be done.
        await Promise.resolve();

        binding = bindings.tapBinder(2)
            .toProduce(() => cmd)
            .onDynamic(doc)
            .bind();

        rect.dispatchEvent(createTouchEvent("touchend", 1, rect, 11, 23, 110, 230));
        rect.dispatchEvent(createTouchEvent("touchend", 1, rect, 11, 23, 110, 230));

        expect(binding).toBeDefined();
        expect(ctx.commands).toHaveLength(1);
    });

    test("dynamic registration with a node added and removed", async () => {
        binding = bindings.tapBinder(1)
            .toProduce(() => cmd)
            .onDynamic(doc)
            .bind();

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        doc.appendChild(rect);
        await Promise.resolve();

        doc.removeChild(rect);
        await Promise.resolve();

        rect.dispatchEvent(createTouchEvent("touchend", 1, rect, 11, 23, 110, 230));

        expect(binding).toBeDefined();
        expect(ctx.commands).toHaveLength(0);
    });

    test("dynamic registration with a node already added then removed", async () => {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        doc.appendChild(rect);
        await Promise.resolve();

        binding = bindings.tapBinder(3)
            .toProduce(() => cmd)
            .onDynamic(doc)
            .bind();

        doc.removeChild(rect);
        await Promise.resolve();

        rect.dispatchEvent(createTouchEvent("touchend", 1, rect, 11, 23, 110, 230));
        rect.dispatchEvent(createTouchEvent("touchend", 1, rect, 11, 23, 110, 230));
        rect.dispatchEvent(createTouchEvent("touchend", 1, rect, 11, 23, 110, 230));

        expect(binding).toBeDefined();
        expect(ctx.commands).toHaveLength(0);
    });
});

