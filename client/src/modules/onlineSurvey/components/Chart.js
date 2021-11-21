import { Bar } from "react-chartjs-2";
import { Container, Row, Col } from "react-bootstrap";
import { Fragment, useEffect, useState } from "react";

const Chart = (props) => {
  const data = {
    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    datasets: [
      {
        label: "# of Votes",
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
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
  return (
    <Fragment>
      <Container className="my-5">
        <Row>
          <Col className="mb-4 " md={{ span: 8, offset: 2 }}>
            <h1 className="title">Question Title</h1>
          </Col>
        </Row>
        <Row>
          <Col className="mb-4 " md={{ span: 8, offset: 2 }}>
            <Bar data={data} />
          </Col>
        </Row>
      </Container>
      ;
    </Fragment>
  );
};

export default Chart;
