const resoveValue = (value) => {
    if (value.length === 0) {
      return "";
    }
  
    if ("null" === value) {
      return null;
    }
  
    if (!isNaN(value)) {
      return +value;
    }
  
    if ("true" === value) {
      return true;
    }
  
    if ("false" === value) {
      return false;
    }
    return value;
  };
  
  export const resolveParams = (text) => {
    if (!text) {
      return {};
    }
    return text
      .split(";")
      .map((v) => {
        let result = {};
        if (v.indexOf("=") !== -1) {
          result[v.substring(0, v.indexOf("="))] = resoveValue(
            v.substring(v.indexOf("=") + 1)
          );
        } else {
          result[v] = true;
        }
        return result;
      })
      .reduce((prev, cur) => {
        return { ...prev, ...cur };
      });
  };
  
  export const startWith = (text, start) => {
    return text && text.indexOf(start) === 0;
  };
  