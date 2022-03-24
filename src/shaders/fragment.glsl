uniform float time;
uniform float progress;
uniform sampler2D txt;
uniform sampler2D txt1;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;

float PI = 3.141592653589793238;

void main()
{
    vec4 tt = texture2D(txt, vUv);
    vec4 tt1 = texture2D(txt1, vUv);

    vec4 finalTxt = mix(tt,tt1, progress);
    
    gl_FragColor = finalTxt;
    //gl_FragColor = vec4(0., 1., 1., 0. );
    if(gl_FragColor.r<0.1 && gl_FragColor.g<0.1 && gl_FragColor.b<0.1)
    discard;
}