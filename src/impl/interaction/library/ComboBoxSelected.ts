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

import {TerminalState} from "../../fsm/TerminalState";
import {isComboBox} from "../../fsm/Events";
import type {FSMDataHandler} from "../../fsm/FSMDataHandler";
import type {WidgetData} from "../../../api/interaction/WidgetData";
import {ComboBoxTransition} from "../../fsm/ComboBoxTransition";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";
import {WidgetDataImpl} from "../WidgetDataImpl";

class ComboBoxSelectedFSM extends FSMImpl {
    public constructor() {
        super();
    }

    public override buildFSM(dataHandler: ComboBoxSelectedHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        const selected: TerminalState = new TerminalState(this, "selected");
        this.addState(selected);

        const tr = new ComboBoxTransition(this.initState, selected);
        tr.action = (event: Event): void => {
            dataHandler.initToSelectedHandler(event);
        };
    }
}


interface ComboBoxSelectedHandler extends FSMDataHandler {
    initToSelectedHandler(event: Event): void;
}

/**
 * A user interaction for CheckBox
 */

export class ComboBoxSelected extends InteractionBase<WidgetData<HTMLSelectElement>, WidgetDataImpl<HTMLSelectElement>, ComboBoxSelectedFSM> {
    private readonly handler: ComboBoxSelectedHandler;

    /**
     * Creates the interaction.
     */
    public constructor() {
        super(new ComboBoxSelectedFSM(), new WidgetDataImpl<HTMLSelectElement>());

        this.handler = {
            "initToSelectedHandler": (event: Event): void => {
                this._data.copy(event);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        this.fsm.buildFSM(this.handler);
    }

    public override onNewNodeRegistered(node: EventTarget): void {
        if (isComboBox(node)) {
            this.registerActionHandlerInput(node);
        }
    }

    public override onNodeUnregistered(node: EventTarget): void {
        if (isComboBox(node)) {
            this.unregisterActionHandlerInput(node);
        }
    }
}
