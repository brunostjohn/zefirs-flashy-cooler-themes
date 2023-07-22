function numberToWord(n) {
  if (n < 0) return false;
  const single_digit = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const double_digit = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const below_hundred = [
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  if (n === 0) return "Zero";
  function translate(n) {
    const word = [];
    if (n < 10) {
      word.push(single_digit[n]);
    } else if (n < 20) {
      word.push(double_digit[n - 10]);
    } else if (n < 100) {
      const rem = translate(n % 10);
      word.push(below_hundred[(n - (n % 10)) / 10 - 2], rem);
    } else if (n < 1000) {
      word.push(
        single_digit[Math.trunc(n / 100)],
        "Hundred",
        translate(n % 100)
      );
    } else if (n < 1000000) {
      word.push(translate(parseInt(n / 1000)), "Thousand", translate(n % 1000));
    } else if (n < 1000000000) {
      word.push(
        translate(parseInt(n / 1000000)),
        "Million",
        translate(n % 1000000)
      );
    } else {
      word.push(
        translate(parseInt(n / 1000000000)),
        "Billion",
        translate(n % 1000000000)
      );
    }
    return word;
  }
  const result = translate(n)
    .flat(Infinity)
    .filter((value) => value.length > 0);
  return result;
}

const textContainer = document.getElementById("text-container");

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
};

let textColour = "#FFFFFF";
let accentColour = "#747bff";
let oldValue;

const setWord = async (n) => {
  const result = numberToWord(n);

  textContainer.style.opacity = 0;
  await sleep(150);

  textContainer.innerHTML = "";

  let fontSize;

  console.log(result.length);

  switch (result.length) {
    case 1:
      fontSize = "190px";
      break;
    case 2:
      fontSize = "130px";
      break;
    default:
      const calc = 100 - result.length * 10;
      fontSize = `${calc >= 12 ? calc : 12}px`;
      break;
  }

  for (const word of result) {
    const para = document.createElement("p");
    para.innerText = word;
    para.classList.add("time-text");
    para.style.color = textColour;
    para.style.fontSize = fontSize;

    textContainer.appendChild(para);
  }

  textContainer.lastChild.style.color = accentColour;

  textContainer.style.opacity = 1;
};

document.addEventListener("configLoaded", (config) => {
  textColour = config.detail.textColour;
  accentColour = config.detail.accentColour;
});

document.addEventListener("sensorUpdate", (sensors) => {
  if (sensors.detail.sensor1.value != oldValue) {
    oldValue = sensors.detail.sensor1.value;
    setWord(sensors.detail.sensor1.value);
  }
});
