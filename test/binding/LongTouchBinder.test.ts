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
import {Subscription} from "rxjs";
import {
    CommandsRegistry,
    EventRegistrationToken,
    LogLevel,
    LongTouch,
    longTouchBinder,
    TouchData,
    UndoCollector,
    WidgetBinding
} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";
import {createTouchEvent} from "../interaction/StubEvents";

let binding: WidgetBinding<StubCmd, LongTouch, TouchData>;
let cmd: StubCmd;
let producedCmds: Array<StubCmd>;
let disposable: Subscription;

beforeEach(() => {
    jest.useFakeTimers();
    producedCmds = [];
});

afterEach(() => {
    jest.clearAllTimers();
    if (disposable !== undefined) {
        disposable.unsubscribe();
    }
    binding.uninstallBinding();
    CommandsRegistry.getInstance().clear();
    UndoCollector.getInstance().clear();
    if (binding !== undefined) {
        binding.uninstallBinding();
    }
});

describe("on canvas", () => {
    let c1: HTMLElement;

    beforeEach(() => {
        document.documentElement.innerHTML = "<html><div><canvas id='c1'/></html>";
        c1 = document.getElementById("c1") as HTMLElement;
    });

    test("run long touch produces cmd", () => {
        binding = longTouchBinder(1000)
            .toProduce(() => new StubCmd(true))
            .on(c1)
            .bind();
        disposable = binding.produces().subscribe(c => producedCmds.push(c));

        c1.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchstart, 1, c1, 11, 23, 110, 230));
        jest.runOnlyPendingTimers();

        expect(binding).not.toBeNull();
        expect(producedCmds).toHaveLength(1);
        expect(producedCmds[0]).toBeInstanceOf(StubCmd);
    });


    test("tap does not produce long touch", () => {
        binding = longTouchBinder(1000)
            .toProduce(() => new StubCmd(true))
            .on(c1)
            .log(LogLevel.INTERACTION)
            .bind();
        disposable = binding.produces().subscribe(c => producedCmds.push(c));

        c1.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchstart, 1, c1, 11, 23, 110, 230));
        c1.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchend, 1, c1, 11, 23, 110, 230));
        jest.runOnlyPendingTimers();

        expect(binding).not.toBeNull();
        expect(producedCmds).toHaveLength(0);
    });


    test("run long touch two times recycle events", () => {
        binding = longTouchBinder(150)
            .toProduce(() => new StubCmd(true))
            .on(c1)
            .bind();
        disposable = binding.produces().subscribe(c => producedCmds.push(c));

        c1.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchstart, 1, c1, 11, 23, 110, 230));
        jest.runOnlyPendingTimers();

        c1.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchstart, 1, c1, 11, 23, 110, 230));
        jest.runOnlyPendingTimers();

        expect(binding).not.toBeNull();
        expect(producedCmds).toHaveLength(2);
    });

    test("unsubscribe does not trigger the binding", () => {
        binding = longTouchBinder(2000)
            .toProduce(() => cmd)
            .on(c1)
            .bind();
        disposable = binding.produces().subscribe(c => producedCmds.push(c));

        binding.getInteraction().onNodeUnregistered(c1);

        c1.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchstart, 1, c1, 11, 23, 110, 230));

        expect(binding.isRunning()).toBeFalsy();
    });
});


describe("on svg doc for dynamic registration", () => {
    let doc: HTMLElement;

    beforeEach(() => {
        document.documentElement.innerHTML = "<html><div><svg id='doc'></svg>svg></html>";
        doc = document.getElementById("doc") as HTMLElement;
    });

    test("tap does not produce long touch on dynamic array", async () => {
        binding = longTouchBinder(1000)
            .toProduce(() => new StubCmd(true))
            .onDynamic(doc)
            .log(LogLevel.INTERACTION)
            .bind();
        disposable = binding.produces().subscribe(c => producedCmds.push(c));

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        doc.appendChild(rect);

        // Waiting for the mutation changes to be done.
        await Promise.resolve();

        rect.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchstart, 1, rect, 11, 23, 110, 230));
        rect.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchend, 1, rect, 11, 23, 110, 230));
        jest.runOnlyPendingTimers();

        expect(binding).not.toBeNull();
        expect(producedCmds).toHaveLength(0);
    });

    test("tap does not produce long touch on dynamic array 2", async () => {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        doc.appendChild(rect);

        // Waiting for the mutation changes to be done.
        await Promise.resolve();

        binding = longTouchBinder(1000)
            .toProduce(() => new StubCmd(true))
            .onDynamic(doc)
            .log(LogLevel.INTERACTION)
            .bind();
        disposable = binding.produces().subscribe(c => producedCmds.push(c));

        rect.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchstart, 1, rect, 11, 23, 110, 230));
        rect.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchend, 1, rect, 11, 23, 110, 230));
        jest.runOnlyPendingTimers();

        expect(binding).not.toBeNull();
        expect(producedCmds).toHaveLength(0);
    });
});
