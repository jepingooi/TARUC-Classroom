import { Bar, Pie } from "react-chartjs-2";
import { Row, Col, Form } from "react-bootstrap";
import { useRef, useState, Fragment } from "react";

const Chart = (props) => {
  const questionRef = useRef(null);
  const [type, setType] = useState("Bar");
  const chartRef = useRef();

  let data = {
    labels: [],
    datasets: [
      {
        label: "# of Answers",
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  };

  const { question } = props;
  const option = {
    indexAxis: "x",
  };

  if (question.type != "Paragraph") {
    const backgroundColor = [
      "rgba(255, 99, 132, 0.2)",
      "rgba(54, 162, 235, 0.2)",
      "rgba(255, 206, 86, 0.2)",
      "rgba(75, 192, 192, 0.2)",
      "rgba(153, 102, 255, 0.2)",
      "rgba(255, 159, 64, 0.2)",
    ];
    const borderColor = [
      "rgba(255, 99, 132, 1)",
      "rgba(54, 162, 235, 1)",
      "rgba(255, 206, 86, 1)",
      "rgba(75, 192, 192, 1)",
      "rgba(153, 102, 255, 1)",
      "rgba(255, 159, 64, 1)",
    ];

    question.options.map((option, index) => {
      let colorIndex = index;
      if (index > 5) {
        colorIndex -= 6;
      }
      data.labels.push(option.option);
      data.datasets[0].data.push(option.answers);
      data.datasets[0].backgroundColor.push(backgroundColor[colorIndex]);
      data.datasets[0].borderColor.push(borderColor[colorIndex]);
    });
  }

  const handleTypeChange = () => {
    props.onChange(chartRef, props.index);
    setType(questionRef.current.value);
  };

  return (
    <Fragment>
      <Row className="mb-4" ref={chartRef}>
        <Col className="d-flex">
          <h3 className="title">{props.question.question}</h3>
        </Col>
        <Col className="text-right" md={4}>
          <Form.Select
            onChange={handleTypeChange}
            size="lg"
            aria-label="Question select"
            ref={questionRef}
          >
            <option value="Bar">Bar</option>
            <option value="Pie">Pie</option>
            <option value="Horizontal Bar">Horizontal Bar</option>
          </Form.Select>
        </Col>
      </Row>
      <Row className="d-flex justify-content-center">
        {type != "Pie" && (
          <Col className="mb-4">
            {type == "Bar" && <Bar data={data} options={option} />}
            {type == "Horizontal Bar" && (
              <Bar data={data} options={{ ...option, indexAxis: "y" }} />
            )}
          </Col>
        )}
        {type == "Pie" && (
          <Col className="mb-4" md={8}>
            <Pie data={data} />
          </Col>
        )}
      </Row>
    </Fragment>
  );
};

export default Chart;
