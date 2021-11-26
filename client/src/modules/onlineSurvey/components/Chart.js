import { Bar, Pie } from "react-chartjs-2";
import { Container, Row, Col, Form } from "react-bootstrap";
import { useRef, useState } from "react";

const DEFAULT_OPTION = {
  indexAxis: "x",
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
        },
      },
    ],
  },
};
const Chart = (props) => {
  const questionRef = useRef(null);
  const [option, setOption] = useState(DEFAULT_OPTION);
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

    question.options.map((option) => {
      const randomNum = Math.floor(Math.random() * 6) + 0;
      data.labels.push(option.option);
      data.datasets[0].data.push(option.answers);
      data.datasets[0].backgroundColor.push(backgroundColor[randomNum]);
      data.datasets[0].borderColor.push(borderColor[randomNum]);
    });
  }

  const handleTypeChange = () => {
    if (questionRef.current.value == "Bar") {
      setOption((prevState) => {
        return { ...prevState, indexAxis: "x" };
      });
    } else if (questionRef.current.value == "Horizontal Bar") {
      setOption((prevState) => {
        return { ...prevState, indexAxis: "y" };
      });
    }
  };

  return (
    <Container className="my-5">
      <Row className="d-flex justify-content-center">
        <Col className="mb-4" md={5}>
          <h1 className="title">{props.question.question}</h1>
        </Col>
        <Col className="text-right" md={3}>
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
      <Row>
        <Col className="mb-4 " md={{ span: 8, offset: 2 }}>
          <Bar data={data} options={option} />
        </Col>
      </Row>
    </Container>
  );
};

export default Chart;
