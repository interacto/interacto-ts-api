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

import { StubFSMHandler } from "../fsm/StubFSMHandler";
import { EventRegistrationToken } from "../../src/fsm/Events";
import { createKeyEvent } from "./StubEvents";
import { FSMHandler } from "../../src/fsm/FSMHandler";
import { KeysPressed } from "../../src";

jest.mock("../fsm/StubFSMHandler");

let interaction: KeysPressed;
let text: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.clearAllMocks();
    handler = new StubFSMHandler();
    interaction = new KeysPressed();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><div><textarea id='text1'></textarea></div></html>";
    const elt = document.getElementById("text1");
    if (elt !== null) {
        text = elt;
    }
});


test("testKeyPressExecution", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "A"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toBeCalled();
});

test("testKeyPressData", () => {
    interaction.registerToNodes([text]);
    let length = 0;
    let txt = "";

    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public fsmUpdates(): void {
            length = interaction.getData().getKeys().length;
            txt = interaction.getData().getKeys()[0];
        }
    }());

    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "A"));
    expect(length).toEqual(1);
    expect(txt).toEqual("A");
});

test("testTwoKeyPressExecution", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "A"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "B"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).not.toBeCalled();
});

test("testTwoKeyPressData", () => {
    interaction.registerToNodes([text]);
    let data: Array<string> = [];

    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public fsmUpdates(): void {
            data = [...interaction.getKeys()];
        }
    }());

    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "A"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "B"));
    expect(data.length).toEqual(2);
    expect(data[0]).toEqual("A");
    expect(data[1]).toEqual("B");
});

test("testTwoKeyPressReleaseExecution", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "A"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "B"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyUp, "B"));
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(3);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});


test("testTwoKeyPressReleaseData", () => {
    interaction.registerToNodes([text]);
    let data: Array<string> = [];

    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "A"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "B"));
    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public fsmUpdates(): void {
            data = [...interaction.getKeys()];
        }
    }());
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyUp, "B"));
    expect(data.length).toEqual(1);
    expect(data[0]).toEqual("A");
});

test("testTwoKeyPressReleaseRecycle", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "A"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "B"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyUp, "B"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
});

test("testTwoKeyPressTwoReleasesExecution", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "A"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "B"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyUp, "A"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyUp, "B"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).toHaveBeenCalledTimes(2);
});
