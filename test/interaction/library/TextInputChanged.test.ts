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

import type {FSMHandler} from "../../../src/interacto";
import {TextInputChanged} from "../../../src/interacto";
import {mock} from "jest-mock-extended";
import {robot} from "../StubEvents";

jest.useFakeTimers();

let interaction: TextInputChanged;
let textArea: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    handler = mock<FSMHandler>();
    interaction = new TextInputChanged();
    interaction.log(true);
    interaction.fsm.log = true;
    interaction.fsm.addHandler(handler);
    textArea = document.createElement("textarea");
});

test("build fsm twice does not work", () => {
    const count = interaction.fsm.states.length;
    interaction.fsm.buildFSM({
        initToChangedHandler(): void {
        }, reinitData(): void {
        }
    });
    expect(interaction.fsm.states).toHaveLength(count);
});

test("type in a text area starts and stops the interaction", () => {
    interaction.registerToNodes([textArea]);
    robot(textArea).input();
    jest.runOnlyPendingTimers();
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
});
