interface OrderOptions {
    maker: string;
    poster?: string;
    subContract: string;
    makerArguments?: Argument[];
    takerArguments?: Argument[];
    makerValues: Values;
    makerSignature?: SignatureObject;
    posterSignature?: SignatureObject;
    id?: string;
}

interface Argument {
    dataType: string;
    name: string;
}

interface Values {
    [key: string]: any;
}

interface SignatureObject {
    v: string;
    r: string;
    s: string;
}