/* eslint-disable no-undef */
import { debounce } from "../../utils/debounceService";

describe("debounce function", () => {
  jest.useFakeTimers();
  let functionMock;

  beforeEach(() => {
    functionMock = jest.fn();
  });

  it("should delay the execution of the function", () => {
    const debouncedFunction = debounce(functionMock, 1000);
    debouncedFunction();
    
    expect(functionMock).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);
    expect(functionMock).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);
    expect(functionMock).toHaveBeenCalledTimes(1);
  });

  it("should only execute the last call if called multiple times within the delay", () => {
    const debouncedFunction = debounce(functionMock, 1000);
    
    debouncedFunction();
    debouncedFunction();
    debouncedFunction();

    jest.advanceTimersByTime(500);
    expect(functionMock).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1000);
    expect(functionMock).toHaveBeenCalledTimes(1);
  });

  it("should pass the correct arguments to the function", () => {
    const debouncedFunction = debounce(functionMock, 1000);
    const args = ['arg1', 'arg2'];

    debouncedFunction(...args);
    jest.advanceTimersByTime(1000);

    expect(functionMock).toHaveBeenCalledWith(...args);
  });

  it("should handle context correctly", () => {
    const context = { value: 42 };
    const debouncedFunction = debounce(function(this) {
      functionMock(this.value);
    }, 1000);

    debouncedFunction.call(context);
    jest.advanceTimersByTime(1000);

    expect(functionMock).toHaveBeenCalledWith(context.value);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });
});
