// Ensure module has at least one export, even if otherwise empty.
export type __module = null;

// Generated from derive-patterns/schema.yaml#/$defs/int.
export type Int = /* A document that holds an integer */ {
    Int: number;
    Key: string;
};

// Generated from derive-patterns/schema.yaml#/$defs/join.
export type Join = /* Document for join examples */ {
    Key?: string;
    LHS?: number;
    RHS?: string[];
};

// Generated from derive-patterns/schema.yaml#/$defs/string.
export type String = /* A document that holds a string */ {
    Key: string;
    String: string;
};
