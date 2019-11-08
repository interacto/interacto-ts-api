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

import { Optional } from "../../util/Optional";
import { KeyData } from "./KeyData";

export class KeyDataImpl implements KeyData {
    /**
     * The key involve in the interaction
     */
    protected key: string | undefined;

    /**
     * The target of the event that trigger the interaction
     */
    protected target: EventTarget | undefined;

    public constructor() { }

    public reinitData(): void {
        this.key = undefined;
        this.target = undefined;
    }

    public getTarget(): Optional<EventTarget> {
        return Optional.of(this.target);
    }

    public getKey(): string {
        return this.key === undefined ? "" : this.key;
    }

    public setKeyData(event: KeyboardEvent): void {
        this.target = event.target === null ? undefined : event.target;
        this.key = event.code;
    }
}
