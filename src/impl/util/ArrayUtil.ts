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

export function remove<T>(array: Array<T>, elt: T): void {
    const index = array.indexOf(elt);
    if (index > -1) {
        array.splice(index, 1);
    }
}

export function removeAt<T>(array: Array<T>, index: number): T | undefined {
    if (index > -1) {
        return array.splice(index, 1)[0];
    }
    return undefined;
}

export function peek<T>(array: ReadonlyArray<T>): T | undefined {
    return array[array.length - 1];
}
