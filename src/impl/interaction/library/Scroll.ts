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

import {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {TerminalState} from "../../fsm/TerminalState";
import {ScrollTransition} from "../../fsm/ScrollTransition";
import {ScrollData} from "../../../api/interaction/ScrollData";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";
import {ScrollDataImpl} from "./ScrollDataImpl";

/**
 * An FSM for scrolling.
 */
export class ScrollFSM extends FSMImpl {
    public buildFSM(dataHandler?: ScrollFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }
        super.buildFSM(dataHandler);
        const scrolled: TerminalState = new TerminalState(this, "scrolled");
        this.addState(scrolled);

        const scroll = new ScrollTransition(this.initState, scrolled);
        scroll.action = (event: UIEvent): void => {
            dataHandler?.initToScroll(event);
        };
    }
}


interface ScrollFSMHandler extends FSMDataHandler {
    initToScroll(event: UIEvent): void;
}

/**
 * A user interaction for pressing down the mouse button.
 */
export class Scroll extends InteractionBase<ScrollData, ScrollFSM> {
    /**
     * Creates the interaction.
     */
    private readonly handler: ScrollFSMHandler;

    public constructor() {
        super(new ScrollFSM());

        this.handler = {
            "initToScroll": (event: UIEvent): void => {
                (this.getData() as ScrollDataImpl).setScrollData(event);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        this.getFsm().buildFSM(this.handler);
    }

    public createDataObject(): ScrollData {
        return new ScrollDataImpl();
    }
}
