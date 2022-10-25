import type {SortInstruction} from "../../service";

type QueryModel = {
    find: string,
    where: string,
    pull: string,
    sortInstructions: Array<SortInstruction>,
}

export default QueryModel