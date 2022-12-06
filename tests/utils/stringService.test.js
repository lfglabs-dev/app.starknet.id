import { is1234Domain } from "../../utils/stringService";

describe("Should test checking if a domain is a 1234 stark domain", () => {

    it("checks some valid 1234 domains", () => {

        expect(is1234Domain("1231")).toBe(true);
        expect(is1234Domain("0231")).toBe(true);
        expect(is1234Domain("1204")).toBe(true);
        expect(is1234Domain("0430")).toBe(true);
    });

    it("checks some invalid domains", () => {
        expect(is1234Domain("1232575")).toBe(false);
        expect(is1234Domain("231")).toBe(false);
        expect(is1234Domain("12043")).toBe(false);
        expect(is1234Domain("1234")).toBe(false);
    });

});

