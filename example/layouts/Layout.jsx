// import '@/styles/styles.scss'; // global styles

const Layout = ({ children, title }) => {
    return <html lang="ru">
        <head>
            <meta charset="UTF-8" />
            <meta name="description" content={ title } />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="generator" content='jtsx-loader' />
            <title>{ title }</title>

            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
            <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@100..900&display=swap" rel="stylesheet" />
            <link rel="stylesheet" href="/styles/styles.css" />
        </head>
        <body>
            <main>
                <div className="container">
                    <div class="logo logo--white">
                        <div class="logo__visual"></div>
                        <a href="/" class="logo__link">
                            <svg class="svg-icon" viewBox="0 0 146 21">
                                <g id="svg-logo">
                                    <path d="M19.5159 17.6268C19.482 17.7623 19.2279 18.1011 18.7535 18.6432C18.4147 19.0498 17.963 19.4112 17.3983 19.7274C16.8336 20.0324 16.0769 20.2695 15.1282 20.439C14.1908 20.6197 12.9541 20.71 11.4181 20.71C9.37394 20.71 7.62903 20.6027 6.18341 20.3881C4.73779 20.1848 3.55758 19.8686 2.64277 19.4394C1.72797 18.999 1.05598 18.4399 0.626812 17.7623C0.208937 17.0847 0 16.2772 0 15.3398C0 14.3572 0.112939 13.5271 0.338817 12.8495C0.575989 12.1605 0.914806 11.5845 1.35527 11.1215C1.80702 10.6584 2.34913 10.297 2.98159 10.0373C3.61405 9.77751 4.33121 9.57987 5.13308 9.44434C5.94624 9.30881 6.83281 9.22411 7.79279 9.19023C8.75277 9.15635 9.77487 9.13941 10.8591 9.13941C12.4064 9.13941 13.6995 9.20717 14.7385 9.3427C15.7776 9.46693 16.6246 9.63069 17.2797 9.83398C17.946 10.026 18.4486 10.2349 18.7874 10.4608C19.1262 10.6867 19.369 10.8956 19.5159 11.0876C19.5159 9.82269 19.4594 8.74412 19.3465 7.8519C19.2448 6.95968 19.0698 6.21428 18.8213 5.61571C18.5841 5.01713 18.2735 4.54279 17.8895 4.19268C17.5055 3.83127 17.0312 3.56022 16.4665 3.37951C15.9131 3.19881 15.2637 3.08587 14.5183 3.0407C13.7729 2.98423 12.9202 2.95599 11.9602 2.95599C10.4694 2.95599 9.23277 2.99552 8.2502 3.07458C7.26763 3.14234 6.48835 3.28352 5.91236 3.4981C5.33637 3.71268 4.92979 4.01197 4.69262 4.39597C4.45544 4.76866 4.33686 5.25995 4.33686 5.86982H1.08421C1.08421 4.84207 1.26492 3.97244 1.62632 3.26093C1.99902 2.54941 2.60889 1.97342 3.45593 1.53296C4.31427 1.08121 5.43801 0.753682 6.82716 0.550392C8.21631 0.347102 9.92734 0.245456 11.9602 0.245456C13.948 0.245456 15.6308 0.409218 17.0086 0.736741C18.3865 1.06426 19.4989 1.64025 20.346 2.46471C21.2043 3.28916 21.8198 4.40161 22.1925 5.80206C22.5765 7.19121 22.7685 8.95306 22.7685 11.0876V20.3034H19.5159V17.6268ZM11.9602 18.135C13.3946 18.135 14.5917 18.0672 15.5517 17.9317C16.523 17.7962 17.3023 17.5929 17.8895 17.3218C18.4768 17.0508 18.8947 16.712 19.1432 16.3054C19.3916 15.8988 19.5159 15.4245 19.5159 14.8824C19.5159 14.3402 19.369 13.8828 19.0754 13.5101C18.7931 13.1262 18.3131 12.8156 17.6354 12.5784C16.9691 12.3412 16.0825 12.1718 14.9757 12.0702C13.8689 11.9572 12.5023 11.9008 10.876 11.9008C9.24971 11.9008 7.93397 11.929 6.92881 11.9855C5.93495 12.0419 5.16696 12.1718 4.62485 12.3751C4.08275 12.5784 3.71569 12.8777 3.5237 13.273C3.343 13.6683 3.25264 14.2047 3.25264 14.8824C3.25264 15.56 3.34864 16.1134 3.54064 16.5426C3.74393 16.9604 4.15051 17.288 4.76038 17.5251C5.37025 17.7623 6.24553 17.9261 7.38621 18.0164C8.53819 18.0955 10.0629 18.135 11.9602 18.135Z"/>
                                    <path d="M45.2504 20.3034V9.46128C45.2504 8.25283 45.16 7.23638 44.9793 6.41193C44.7986 5.57618 44.4372 4.90419 43.8951 4.39597C43.353 3.88774 42.585 3.52069 41.5911 3.29481C40.5973 3.06893 39.2872 2.95599 37.6609 2.95599C35.899 2.95599 34.4534 3.08587 33.324 3.34563C32.2059 3.60539 31.325 3.97244 30.6812 4.44679C30.0375 4.92113 29.5914 5.49147 29.3429 6.15781C29.1057 6.82415 28.9872 7.56391 28.9872 8.37707V20.3034H25.7345V0.787564H28.9872V4.04021C29.2243 3.48681 29.5631 3.01246 30.0036 2.61718C30.4441 2.2106 30.941 1.86613 31.4944 1.58378C32.0478 1.30144 32.6464 1.07556 33.2901 0.90615C33.9339 0.725447 34.5776 0.589921 35.2214 0.499569C35.8651 0.397924 36.4863 0.330161 37.0849 0.296279C37.6948 0.262397 38.2482 0.245456 38.7451 0.245456C40.1907 0.245456 41.433 0.335808 42.4721 0.51651C43.5224 0.697213 44.409 0.962619 45.1318 1.31273C45.8659 1.66284 46.4532 2.09766 46.8936 2.61718C47.3341 3.1367 47.6729 3.74092 47.9101 4.42985C48.1586 5.10748 48.3223 5.86982 48.4014 6.71686C48.4804 7.55261 48.52 8.46742 48.52 9.46128L48.503 20.3034H45.2504Z"/>
                                    <path d="M50.9439 10.5794C50.9439 9.22411 51.0116 8.02696 51.1471 6.98792C51.2827 5.94888 51.5198 5.04537 51.8587 4.27738C52.2088 3.50939 52.6718 2.87129 53.2478 2.36306C53.8351 1.84354 54.5692 1.42567 55.4501 1.10944C56.3423 0.793211 57.3983 0.567333 58.6181 0.431806C59.8378 0.296279 61.2608 0.228516 62.8872 0.228516C65.0556 0.228516 66.84 0.364042 68.2405 0.635096C69.6409 0.894856 70.7477 1.30144 71.5609 1.85484C72.374 2.39694 72.9387 3.09152 73.255 3.93856C73.5712 4.77431 73.7293 5.77382 73.7293 6.93709H70.4767C70.4767 6.51922 70.4654 6.12958 70.4428 5.76818C70.4202 5.40677 70.3355 5.07925 70.1887 4.78561C70.0531 4.49196 69.8329 4.2322 69.528 4.00633C69.223 3.76915 68.7882 3.57151 68.2235 3.4134C67.6588 3.25528 66.9417 3.1367 66.072 3.05764C65.2137 2.97858 64.1521 2.93905 62.8872 2.93905C61.4415 2.93905 60.2218 2.98987 59.2279 3.09152C58.2454 3.19317 57.4322 3.36257 56.7885 3.59975C56.1447 3.82562 55.6478 4.13621 55.2977 4.53149C54.9475 4.91549 54.6934 5.38983 54.5353 5.95452C54.3772 6.51922 54.2812 7.18556 54.2473 7.95355C54.2247 8.71024 54.2134 9.58551 54.2134 10.5794C54.2134 11.5507 54.2247 12.4146 54.2473 13.1713C54.2812 13.9167 54.3772 14.5718 54.5353 15.1365C54.6934 15.6899 54.9475 16.1586 55.2977 16.5426C55.6478 16.9266 56.1447 17.2371 56.7885 17.4743C57.4322 17.7115 58.2454 17.8809 59.2279 17.9825C60.2218 18.0842 61.4415 18.135 62.8872 18.135C64.1521 18.135 65.2137 18.0898 66.072 17.9995C66.9417 17.9091 67.6588 17.7792 68.2235 17.6098C68.7882 17.4404 69.223 17.2315 69.528 16.983C69.8329 16.7346 70.0531 16.4522 70.1887 16.136C70.3355 15.8085 70.4202 15.4527 70.4428 15.0687C70.4654 14.6734 70.4767 14.2499 70.4767 13.7981H73.7293C73.7293 14.984 73.5712 16.0117 73.255 16.8814C72.9387 17.751 72.374 18.4682 71.5609 19.0329C70.7477 19.5863 69.6409 19.9985 68.2405 20.2695C66.84 20.5406 65.0556 20.6761 62.8872 20.6761C61.2608 20.6761 59.8378 20.6084 58.6181 20.4728C57.3983 20.3373 56.3423 20.1171 55.4501 19.8121C54.5692 19.4959 53.8351 19.0837 53.2478 18.5755C52.6718 18.0672 52.2088 17.4404 51.8587 16.695C51.5198 15.9496 51.2827 15.0744 51.1471 14.0692C51.0116 13.0527 50.9439 11.8895 50.9439 10.5794Z"/>
                                    <path d="M93.5006 7.14038C93.5006 6.32722 93.4385 5.65524 93.3143 5.12442C93.2013 4.58232 92.9246 4.15315 92.4842 3.83692C92.0437 3.50939 91.3887 3.28352 90.519 3.15928C89.6607 3.02376 88.4861 2.95599 86.9953 2.95599C85.5384 2.95599 84.3526 3.08587 83.4378 3.34563C82.523 3.5941 81.8058 3.94986 81.2863 4.41291C80.7668 4.87596 80.411 5.42936 80.219 6.07311C80.0383 6.71686 79.948 7.43403 79.948 8.2246V20.3034H76.6953V0.787564H79.948V3.88774C80.0609 3.53763 80.2698 3.15364 80.5748 2.73576C80.8797 2.30659 81.3428 1.91131 81.9639 1.5499C82.5851 1.1772 83.3869 0.866621 84.3695 0.618155C85.3634 0.369689 86.6001 0.245456 88.0796 0.245456C89.7737 0.245456 91.1515 0.397924 92.2131 0.70286C93.2748 0.996501 94.0992 1.43696 94.6865 2.02425C95.2851 2.60024 95.686 3.3174 95.8893 4.17573C96.1039 5.03407 96.2112 6.02229 96.2112 7.14038H93.5006Z"/>
                                    <path d="M96.4497 10.41C96.4497 8.41095 96.6643 6.75639 97.0935 5.4463C97.5226 4.13621 98.2115 3.09717 99.1602 2.32918C100.109 1.5612 101.34 1.02474 102.853 0.7198C104.367 0.403571 106.208 0.245456 108.376 0.245456C110.544 0.245456 112.385 0.403571 113.899 0.7198C115.412 1.02474 116.643 1.5612 117.592 2.32918C118.541 3.09717 119.229 4.13621 119.659 5.4463C120.088 6.75639 120.302 8.41095 120.302 10.41C120.302 12.409 120.088 14.0692 119.659 15.3906C119.229 16.712 118.541 17.7623 117.592 18.5416C116.643 19.3209 115.412 19.8743 113.899 20.2018C112.385 20.518 110.544 20.6761 108.376 20.6761C106.208 20.6761 104.367 20.518 102.853 20.2018C101.34 19.8743 100.109 19.3209 99.1602 18.5416C98.2115 17.7623 97.5226 16.712 97.0935 15.3906C96.6643 14.0692 96.4497 12.409 96.4497 10.41ZM99.7023 10.41C99.7023 11.4942 99.7419 12.4372 99.8209 13.2391C99.9 14.041 100.047 14.7299 100.261 15.3059C100.487 15.8819 100.798 16.3506 101.193 16.712C101.588 17.0734 102.108 17.3614 102.752 17.576C103.395 17.7905 104.175 17.9374 105.09 18.0164C106.016 18.0955 107.111 18.135 108.376 18.135C109.46 18.135 110.426 18.1124 111.273 18.0672C112.131 18.0108 112.877 17.8922 113.509 17.7115C114.153 17.5308 114.701 17.2767 115.152 16.9491C115.604 16.6103 115.966 16.1529 116.237 15.5769C116.519 15.0009 116.722 14.2951 116.846 13.4593C116.982 12.6123 117.05 11.5958 117.05 10.41C117.05 9.2467 116.982 8.25848 116.846 7.44532C116.722 6.62086 116.519 5.93194 116.237 5.37854C115.966 4.82513 115.604 4.39032 115.152 4.07409C114.701 3.74657 114.153 3.50375 113.509 3.34563C112.877 3.17622 112.131 3.06893 111.273 3.02376C110.426 2.97858 109.46 2.95599 108.376 2.95599C107.292 2.95599 106.321 2.97858 105.462 3.02376C104.615 3.06893 103.87 3.17622 103.226 3.34563C102.594 3.50375 102.051 3.74657 101.6 4.07409C101.148 4.39032 100.781 4.82513 100.499 5.37854C100.228 5.93194 100.024 6.62086 99.8887 7.44532C99.7645 8.25848 99.7023 9.2467 99.7023 10.41Z"/>
                                    <path d="M134.094 11.4095C135.359 11.4095 136.437 11.4321 137.329 11.4772C138.222 11.5111 138.967 11.5789 139.566 11.6805C140.175 11.7709 140.655 11.8895 141.006 12.0363C141.356 12.1831 141.621 12.4033 141.802 12.697C141.982 12.9793 142.095 13.2673 142.141 13.561C142.197 13.8433 142.225 14.1708 142.225 14.5435C142.225 14.9501 142.197 15.3228 142.141 15.6616C142.095 15.9892 141.977 16.2884 141.785 16.5595C141.593 16.8306 141.31 17.0621 140.938 17.2541C140.565 17.4461 140.057 17.6098 139.413 17.7454C138.769 17.8809 137.967 17.9825 137.007 18.0503C136.059 18.1068 134.907 18.135 133.552 18.135C132.061 18.135 130.824 18.0955 129.841 18.0164C128.87 17.9261 128.097 17.7623 127.521 17.5251C126.945 17.288 126.538 16.9604 126.301 16.5426C126.075 16.1134 125.962 15.56 125.962 14.8824H122.709C122.709 15.9101 122.89 16.7797 123.251 17.4912C123.624 18.2028 124.234 18.7844 125.081 19.2362C125.928 19.6766 127.041 19.9985 128.418 20.2018C129.808 20.4051 131.519 20.5067 133.552 20.5067C135.178 20.5067 136.601 20.4559 137.821 20.3543C139.052 20.2639 140.108 20.1227 140.989 19.9307C141.869 19.7274 142.598 19.4677 143.174 19.1515C143.761 18.8239 144.224 18.4399 144.563 17.9995C144.902 17.5477 145.139 17.0338 145.275 16.4579C145.41 15.8706 145.478 15.2099 145.478 14.4758C145.478 13.7417 145.41 13.0979 145.275 12.5445C145.139 11.9798 144.902 11.4942 144.563 11.0876C144.236 10.6697 143.795 10.2857 143.242 9.93563C142.688 9.58551 141.988 9.32575 141.141 9.15635C140.294 8.98694 139.289 8.86835 138.126 8.80059C136.974 8.73282 135.63 8.69894 134.094 8.69894C132.829 8.69894 131.75 8.69894 130.858 8.69894C129.966 8.68765 129.215 8.65377 128.605 8.5973C128.006 8.52953 127.532 8.43354 127.182 8.3093C126.832 8.18507 126.566 8.00437 126.386 7.7672C126.205 7.53002 126.086 7.23074 126.03 6.86933C125.985 6.49663 125.962 6.11829 125.962 5.73429C125.962 5.07925 126.109 4.56537 126.402 4.19268C126.696 3.81998 127.182 3.54328 127.859 3.36257C128.537 3.18187 129.429 3.06893 130.536 3.02376C131.643 2.97858 133.009 2.95599 134.636 2.95599C136.127 2.95599 137.358 3.00117 138.329 3.09152C139.311 3.17058 140.091 3.32305 140.667 3.54892C141.243 3.76351 141.644 4.0628 141.869 4.44679C142.107 4.83078 142.225 5.32771 142.225 5.93758H145.478C145.478 4.95501 145.314 4.10797 144.987 3.39646C144.659 2.68494 144.083 2.09766 143.259 1.63461C142.445 1.16026 141.339 0.810152 139.938 0.584274C138.549 0.358396 136.782 0.245456 134.636 0.245456C132.467 0.245456 130.626 0.341455 129.113 0.533451C127.6 0.725447 126.369 1.04168 125.42 1.48214C124.471 1.91131 123.782 2.476 123.353 3.17622C122.924 3.86515 122.709 4.71784 122.709 5.73429C122.709 6.47969 122.777 7.17427 122.913 7.81802C123.048 8.45048 123.28 8.98694 123.607 9.4274C123.935 9.85657 124.375 10.201 124.929 10.4608C125.493 10.7206 126.194 10.9238 127.029 11.0707C127.876 11.2062 128.882 11.2965 130.045 11.3417C131.208 11.3869 132.558 11.4095 134.094 11.4095Z"/>
                                </g>
                            </svg>
                        </a>
                    </div>
                    { children }
                </div>
            </main>

            {/* <script src="/assets/js/app.js"></script> */ }
        </body>
    </html>
};

export default Layout;
